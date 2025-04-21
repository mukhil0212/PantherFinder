-- Update the get_conversations function to filter out conversations with yourself
CREATE OR REPLACE FUNCTION get_conversations(user_uuid UUID)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT,
    item_id UUID,
    item_name TEXT
)
LANGUAGE SQL
AS $$
    WITH conversations AS (
        -- Get all conversations where the user is either sender or receiver
        SELECT DISTINCT
            CASE
                WHEN sender_id = user_uuid THEN receiver_id
                ELSE sender_id
            END AS other_user_id,
            item_id
        FROM messages
        WHERE (sender_id = user_uuid OR receiver_id = user_uuid)
        -- Filter out conversations with yourself
        AND NOT (sender_id = receiver_id)
    ),
    last_messages AS (
        -- Get the last message for each conversation
        SELECT
            c.other_user_id,
            c.item_id,
            (
                SELECT m.content
                FROM messages m
                WHERE (
                    (m.sender_id = c.other_user_id AND m.receiver_id = user_uuid) OR
                    (m.sender_id = user_uuid AND m.receiver_id = c.other_user_id)
                )
                AND (m.item_id = c.item_id OR (m.item_id IS NULL AND c.item_id IS NULL))
                ORDER BY m.created_at DESC
                LIMIT 1
            ) AS last_message,
            (
                SELECT m.created_at
                FROM messages m
                WHERE (
                    (m.sender_id = c.other_user_id AND m.receiver_id = user_uuid) OR
                    (m.sender_id = user_uuid AND m.receiver_id = c.other_user_id)
                )
                AND (m.item_id = c.item_id OR (m.item_id IS NULL AND c.item_id IS NULL))
                ORDER BY m.created_at DESC
                LIMIT 1
            ) AS last_message_time,
            (
                SELECT COUNT(m.id)
                FROM messages m
                WHERE m.sender_id = c.other_user_id
                AND m.receiver_id = user_uuid
                AND m.read = false
                AND (m.item_id = c.item_id OR (m.item_id IS NULL AND c.item_id IS NULL))
            ) AS unread_count
        FROM conversations c
    )
    -- Join with users and items to get names
    SELECT
        gen_random_uuid() AS conversation_id,
        lm.other_user_id,
        COALESCE(p.name, u.email) AS other_user_name,
        lm.last_message,
        lm.last_message_time,
        lm.unread_count,
        lm.item_id,
        i.name AS item_name
    FROM last_messages lm
    LEFT JOIN auth.users u ON lm.other_user_id = u.id
    LEFT JOIN profiles p ON lm.other_user_id = p.id
    LEFT JOIN items i ON lm.item_id = i.id
    WHERE lm.last_message IS NOT NULL
    -- Additional filter to ensure we don't include conversations with yourself
    AND lm.other_user_id != user_uuid
    ORDER BY lm.last_message_time DESC;
$$;
