from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.notification import Notification
from app import db

notifications_bp = Blueprint('notifications', __name__)

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    is_read = request.args.get('is_read')
    
    # Start with base query for current user
    query = Notification.query.filter_by(user_id=user_id)
    
    # Apply filters if provided
    if is_read is not None:
        is_read_bool = is_read.lower() == 'true'
        query = query.filter(Notification.is_read == is_read_bool)
    
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    notifications = query.order_by(Notification.timestamp.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'notifications': [notification.to_dict() for notification in notifications.items],
        'total': notifications.total,
        'pages': notifications.pages,
        'current_page': page,
        'unread_count': Notification.query.filter_by(user_id=user_id, is_read=False).count()
    }), 200

@notifications_bp.route('/<int:notification_id>', methods=['GET'])
@jwt_required()
def get_notification(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.get_or_404(notification_id)
    
    # Users can only view their own notifications
    if notification.user_id != user_id and not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify(notification.to_dict()), 200

@notifications_bp.route('/<int:notification_id>/mark-read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.get_or_404(notification_id)
    
    # Users can only update their own notifications
    if notification.user_id != user_id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification.to_dict()
    }), 200

@notifications_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    user_id = get_jwt_identity()
    
    # Update all unread notifications for the user
    Notification.query.filter_by(user_id=user_id, is_read=False).update({Notification.is_read: True})
    db.session.commit()
    
    return jsonify({'message': 'All notifications marked as read'}), 200

@notifications_bp.route('/', methods=['POST'])
@jwt_required()
def create_notification():
    # Only admins can create notifications manually
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('user_id', 'message')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create new notification
    notification = Notification(
        user_id=data['user_id'],
        item_id=data.get('item_id'),
        message=data['message'],
        notification_type=data.get('notification_type', 'system'),
        is_read=False
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        'message': 'Notification created successfully',
        'notification': notification.to_dict()
    }), 201

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.get_or_404(notification_id)
    
    # Users can only delete their own notifications, admins can delete any
    if notification.user_id == user_id or is_admin():
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({'message': 'Notification deleted successfully'}), 200
    
    return jsonify({'error': 'Unauthorized to delete this notification'}), 403