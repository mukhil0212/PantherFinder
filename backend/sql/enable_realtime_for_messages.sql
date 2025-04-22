-- Enable real-time for the messages table
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Make sure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Verify the RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';
