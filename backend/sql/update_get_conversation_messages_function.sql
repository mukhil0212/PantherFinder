-- Update the get_conversation_messages function to filter out messages with yourself
CREATE OR REPLACE FUNCTION get_conversation_messages(
    user1_uuid UUID,
    user2_uuid UUID,
    item_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    is_sender BOOLEAN
)
LANGUAGE SQL
AS $$
    SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.read,
        m.created_at,
        m.sender_id = user1_uuid AS is_sender
    FROM messages m
    WHERE ((m.sender_id = user1_uuid AND m.receiver_id = user2_uuid)
        OR (m.sender_id = user2_uuid AND m.receiver_id = user1_uuid))
        AND (m.item_id = item_uuid OR (item_uuid IS NULL AND m.item_id IS NULL))
        -- Filter out messages with yourself
        AND user1_uuid != user2_uuid
    ORDER BY m.created_at ASC;
$$;
