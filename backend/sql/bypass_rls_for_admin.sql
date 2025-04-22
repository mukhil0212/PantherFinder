-- Create a function to bypass RLS for admin operations
CREATE OR REPLACE FUNCTION insert_message_bypass_rls(
    p_sender_id UUID,
    p_receiver_id UUID,
    p_content TEXT,
    p_item_id UUID DEFAULT NULL
)
RETURNS SETOF messages
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the function creator
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO messages (
        sender_id,
        receiver_id,
        content,
        item_id,
        read,
        created_at,
        updated_at
    )
    VALUES (
        p_sender_id,
        p_receiver_id,
        p_content,
        p_item_id,
        FALSE,
        NOW(),
        NOW()
    )
    RETURNING *;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_message_bypass_rls TO authenticated;
