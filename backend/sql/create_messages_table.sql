-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_item_id ON messages(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Add RLS policies for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert messages
CREATE POLICY messages_insert_policy ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy to allow users to read messages they sent or received
CREATE POLICY messages_select_policy ON messages
    FOR SELECT
    TO authenticated
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Policy to allow users to update only their own messages
CREATE POLICY messages_update_policy ON messages
    FOR UPDATE
    TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Policy to allow users to delete only their own messages
CREATE POLICY messages_delete_policy ON messages
    FOR DELETE
    TO authenticated
    USING (sender_id = auth.uid());

-- Create a function to get conversations for a user
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
        WHERE sender_id = user_uuid OR receiver_id = user_uuid
    ),
    last_messages AS (
        -- Get the last message for each conversation
        SELECT
            c.other_user_id,
            c.item_id,
            m.content AS last_message,
            m.created_at AS last_message_time,
            COUNT(m.id) FILTER (WHERE m.read = false AND m.receiver_id = user_uuid) AS unread_count
        FROM conversations c
        JOIN messages m ON (m.sender_id = c.other_user_id AND m.receiver_id = user_uuid) 
                        OR (m.sender_id = user_uuid AND m.receiver_id = c.other_user_id)
        WHERE c.item_id = m.item_id OR m.item_id IS NULL
        GROUP BY c.other_user_id, c.item_id, m.content, m.created_at
        ORDER BY m.created_at DESC
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
    ORDER BY lm.last_message_time DESC;
$$;

-- Create a function to get messages between two users for a specific item
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
    ORDER BY m.created_at ASC;
$$;
