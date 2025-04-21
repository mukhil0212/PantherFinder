from flask import Blueprint, request, jsonify, current_app, g
from datetime import datetime
from app.utils.supabase import get_supabase_client
from app.utils.supabase_auth import supabase_auth_required

messages_bp = Blueprint('messages', __name__)
supabase = get_supabase_client()

@messages_bp.route('/conversations', methods=['GET'])
@supabase_auth_required
def get_conversations():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        current_app.logger.info(f"Fetching conversations for user {user_id}")

        # Call the get_conversations function
        result = supabase.rpc('get_conversations', {'user_uuid': user_id}).execute()

        if not result.data:
            return jsonify({'conversations': []}), 200

        return jsonify({'conversations': result.data}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching conversations: {str(e)}")
        return jsonify({'error': f"Failed to fetch conversations: {str(e)}"}), 500

@messages_bp.route('/conversations/<receiver_id>', methods=['GET'])
@supabase_auth_required
def get_conversation_messages(receiver_id):
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Prevent fetching messages with yourself
        if user_id == receiver_id:
            return jsonify({'error': 'You cannot message yourself'}), 400

        # Get item_id from query params if provided
        item_id = request.args.get('item_id')

        current_app.logger.info(f"Fetching messages between {user_id} and {receiver_id} for item {item_id}")

        # Call the get_conversation_messages function
        if item_id:
            result = supabase.rpc('get_conversation_messages', {
                'user1_uuid': user_id,
                'user2_uuid': receiver_id,
                'item_uuid': item_id
            }).execute()
        else:
            result = supabase.rpc('get_conversation_messages', {
                'user1_uuid': user_id,
                'user2_uuid': receiver_id
            }).execute()

        if not result.data:
            return jsonify({'messages': []}), 200

        # Mark messages as read
        messages_to_mark = []
        for message in result.data:
            if message.get('receiver_id') == user_id and not message.get('read'):
                messages_to_mark.append(message.get('id'))

        if messages_to_mark:
            supabase.table('messages').update({'read': True}).in_('id', messages_to_mark).execute()

        return jsonify({'messages': result.data}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching messages: {str(e)}")
        return jsonify({'error': f"Failed to fetch messages: {str(e)}"}), 500

@messages_bp.route('/send', methods=['POST'])
@supabase_auth_required
def send_message():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        data = request.get_json()

        # Validate required fields
        if 'receiver_id' not in data:
            return jsonify({'error': 'Receiver ID is required'}), 400
        if 'content' not in data:
            return jsonify({'error': 'Message content is required'}), 400

        # Prevent messaging yourself
        if user_id == data['receiver_id']:
            return jsonify({'error': 'You cannot message yourself'}), 400

        # Create message data
        message_data = {
            'sender_id': user_id,
            'receiver_id': data['receiver_id'],
            'content': data['content'],
            'read': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        # Add item_id if provided
        if 'item_id' in data and data['item_id']:
            message_data['item_id'] = data['item_id']

            # Check if item exists
            item_result = supabase.table('items').select('*').eq('id', data['item_id']).execute()
            if not item_result.data or len(item_result.data) == 0:
                return jsonify({'error': 'Item not found'}), 404

        # Insert message into Supabase
        result = supabase.table('messages').insert(message_data).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Failed to send message'}), 500

        # Create notification for receiver
        notification_data = {
            'user_id': data['receiver_id'],
            'related_id': result.data[0].get('id'),
            'title': 'New Message',
            'message': f"You have a new message from {user.get('name') or user.get('email')}",
            'type': 'message',
            'created_at': datetime.utcnow().isoformat(),
            'read': False
        }

        supabase.table('notifications').insert(notification_data).execute()

        return jsonify({
            'message': 'Message sent successfully',
            'data': result.data[0]
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error sending message: {str(e)}")
        return jsonify({'error': f"Failed to send message: {str(e)}"}), 500

@messages_bp.route('/<message_id>/read', methods=['POST'])
@supabase_auth_required
def mark_as_read(message_id):
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Check if message exists and user is the receiver
        message_result = supabase.table('messages').select('*').eq('id', message_id).execute()

        if not message_result.data or len(message_result.data) == 0:
            return jsonify({'error': 'Message not found'}), 404

        message = message_result.data[0]

        if message.get('receiver_id') != user_id:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Update message as read
        update_result = supabase.table('messages').update({'read': True}).eq('id', message_id).execute()

        if not update_result.data or len(update_result.data) == 0:
            return jsonify({'error': 'Failed to mark message as read'}), 500

        return jsonify({
            'message': 'Message marked as read',
            'data': update_result.data[0]
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error marking message as read: {str(e)}")
        return jsonify({'error': f"Failed to mark message as read: {str(e)}"}), 500

@messages_bp.route('/unread-count', methods=['GET'])
@supabase_auth_required
def get_unread_count():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Count unread messages
        result = supabase.table('messages').select('id', count='exact').eq('receiver_id', user_id).eq('read', False).execute()

        unread_count = result.count if hasattr(result, 'count') else 0

        return jsonify({'unread_count': unread_count}), 200
    except Exception as e:
        current_app.logger.error(f"Error getting unread count: {str(e)}")
        return jsonify({'error': f"Failed to get unread count: {str(e)}"}), 500
