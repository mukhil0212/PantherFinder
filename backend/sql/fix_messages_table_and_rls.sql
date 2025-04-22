-- Check the structure of the messages table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages';

-- Check the current RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';

-- Temporarily disable RLS for the messages table to allow direct inspection
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Check a sample of messages to understand the data structure
SELECT id, sender_id, receiver_id, content, created_at
FROM messages
LIMIT 5;

-- Drop all existing policies for the messages table
DROP POLICY IF EXISTS messages_insert_policy ON messages;
DROP POLICY IF EXISTS messages_select_policy ON messages;
DROP POLICY IF EXISTS messages_update_policy ON messages;
DROP POLICY IF EXISTS messages_delete_policy ON messages;

-- Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create new policies with explicit conditions
-- Insert policy: Allow authenticated users to insert messages where they are the sender
CREATE POLICY messages_insert_policy ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = sender_id::text);

-- Select policy: Allow authenticated users to select messages where they are either the sender or receiver
CREATE POLICY messages_select_policy ON messages
    FOR SELECT
    TO authenticated
    USING ((auth.uid()::text = sender_id::text) OR (auth.uid()::text = receiver_id::text));

-- Update policy: Allow authenticated users to update messages where they are the sender
CREATE POLICY messages_update_policy ON messages
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = sender_id::text);

-- Delete policy: Allow authenticated users to delete messages where they are the sender
CREATE POLICY messages_delete_policy ON messages
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = sender_id::text);

-- Verify the updated policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';

-- Enable real-time for the messages table
ALTER TABLE messages REPLICA IDENTITY FULL;
