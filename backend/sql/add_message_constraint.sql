-- Add a constraint to prevent messaging yourself
ALTER TABLE messages
ADD CONSTRAINT no_self_messaging
CHECK (sender_id != receiver_id);
