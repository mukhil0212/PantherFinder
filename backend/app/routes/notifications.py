from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import os
from app.utils.supabase import get_supabase_client

notifications_bp = Blueprint('notifications', __name__)
supabase = get_supabase_client()

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"Fetching notifications for user {user_id}")
        
        # Get query parameters for filtering
        is_read = request.args.get('is_read')
        
        # Start with base query for current user
        query = supabase.table('notifications').select('*').eq('user_id', user_id)
        
        # Apply filters if provided
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            query = query.eq('read', is_read_bool)
        
        # Get paginated results
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Calculate start and end for pagination
        start = (page - 1) * per_page
        end = start + per_page - 1
        
        # Execute the query with pagination and ordering
        result = query.order('created_at', desc=True).range(start, end).execute()
        
        # Get total count for pagination
        count_result = supabase.table('notifications')\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .execute()
        
        total_count = count_result.count if hasattr(count_result, 'count') else 0
        
        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 0
        
        # Get unread count
        unread_result = supabase.table('notifications')\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .eq('read', False)\
            .execute()
        
        unread_count = unread_result.count if hasattr(unread_result, 'count') else 0
        
        current_app.logger.info(f"Found {len(result.data)} notifications, total: {total_count}, unread: {unread_count}")
        
        return jsonify({
            'notifications': result.data,
            'total': total_count,
            'pages': total_pages,
            'current_page': page,
            'unread_count': unread_count
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching notifications: {str(e)}")
        return jsonify({'error': f"Failed to fetch notifications: {str(e)}"}), 500

@notifications_bp.route('/<string:notification_id>', methods=['GET'])
@jwt_required()
def get_notification(notification_id):
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"User {user_id} requesting notification {notification_id}")
        
        # Query notification from Supabase
        result = supabase.table('notifications').select('*').eq('id', notification_id).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Notification not found'}), 404
            
        notification = result.data[0]
        
        # Users can only view their own notifications
        if notification.get('user_id') != user_id and not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403
    
        current_app.logger.info(f"Returning notification: {notification}")
        return jsonify(notification), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching notification {notification_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch notification: {str(e)}"}), 500

@notifications_bp.route('/<string:notification_id>/mark-read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"User {user_id} marking notification {notification_id} as read")
        
        # Check if notification exists and belongs to user
        check_result = supabase.table('notifications').select('*').eq('id', notification_id).execute()
        
        if not check_result.data or len(check_result.data) == 0:
            return jsonify({'error': 'Notification not found'}), 404
            
        notification = check_result.data[0]
        
        # Users can only update their own notifications
        if notification.get('user_id') != user_id and not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Update notification in Supabase
        result = supabase.table('notifications').update({'read': True}).eq('id', notification_id).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Failed to update notification'}), 500
            
        updated_notification = result.data[0]
        current_app.logger.info(f"Notification marked as read: {updated_notification}")
        
        return jsonify({
            'message': 'Notification marked as read',
            'notification': updated_notification
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error marking notification as read: {str(e)}")
        return jsonify({'error': f"Failed to mark notification as read: {str(e)}"}), 500

@notifications_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"User {user_id} marking all notifications as read")
        
        # Update all unread notifications for the user
        result = supabase.table('notifications').update({'read': True}).eq('user_id', user_id).eq('read', False).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Failed to update notifications'}), 500
            
        updated_notifications = result.data
        current_app.logger.info(f"All notifications marked as read: {updated_notifications}")
        
        return jsonify({
            'message': 'All notifications marked as read',
            'notifications': updated_notifications
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error marking all notifications as read: {str(e)}")
        return jsonify({'error': f"Failed to mark all notifications as read: {str(e)}"}), 500
@notifications_bp.route('/', methods=['POST'])
@jwt_required()
def create_notification():
    try:
        # Only admins can create notifications manually
        if not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403
        
        data = request.get_json()
        current_app.logger.info(f"Admin creating notification with data: {data}")
        
        # Validate required fields
        if not all(k in data for k in ('user_id', 'message')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Prepare notification data for Supabase
        notification_data = {
            'user_id': data['user_id'],
            'item_id': data.get('item_id'),
            'message': data['message'],
            'notification_type': data.get('notification_type', 'system'),
            'read': False,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Insert notification into Supabase
        result = supabase.table('notifications').insert(notification_data).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Failed to create notification'}), 500
            
        created_notification = result.data[0]
        current_app.logger.info(f"Notification created successfully: {created_notification}")
        
        return jsonify({
            'message': 'Notification created successfully',
            'notification': created_notification
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating notification: {str(e)}")
        return jsonify({'error': f"Failed to create notification: {str(e)}"}), 500

@notifications_bp.route('/<string:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"User {user_id} attempting to delete notification {notification_id}")
        
        # Check if notification exists
        check_result = supabase.table('notifications').select('*').eq('id', notification_id).execute()
        
        if not check_result.data or len(check_result.data) == 0:
            return jsonify({'error': 'Notification not found'}), 404
            
        notification = check_result.data[0]
        
        # Users can only delete their own notifications
        if notification.get('user_id') != user_id and not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Delete notification from Supabase
        result = supabase.table('notifications').delete().eq('id', notification_id).execute()
        
        current_app.logger.info(f"Notification {notification_id} deleted successfully")
        return jsonify({'message': 'Notification deleted successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting notification {notification_id}: {str(e)}")
        return jsonify({'error': f"Failed to delete notification: {str(e)}"}), 500