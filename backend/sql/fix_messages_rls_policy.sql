-- Drop the existing insert policy
DROP POLICY IF EXISTS messages_insert_policy ON messages;

-- Create a new insert policy with an explicit condition
CREATE POLICY messages_insert_policy ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- Verify the updated policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';
