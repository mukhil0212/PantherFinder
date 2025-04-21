from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.user import User
from app.models.item import Item
from app.models.claim import Claim
from app.models.notification import Notification
from app import db

users_bp = Blueprint('users', __name__)

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    # Only admins can list all users
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    users = User.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own profile unless they're admins
    if current_user_id != user_id and not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only update their own profile unless they're admins
    if current_user_id != user_id and not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        user.name = data['name']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    
    # Only admins can update roles
    if 'role' in data and is_admin():
        user.role = data['role']
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    }), 200

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    # Only admins can delete users
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    user = User.query.get_or_404(user_id)
    
    # Delete associated data
    Notification.query.filter_by(user_id=user.id).delete()
    Claim.query.filter_by(user_id=user.id).delete()
    
    # Update items where this user is the finder or claimer
    Item.query.filter_by(user_found_id=user.id).update({Item.user_found_id: None})
    Item.query.filter_by(user_claimed_id=user.id).update({Item.user_claimed_id: None, Item.status: 'found'})
    
    # Delete the user
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'}), 200

@users_bp.route('/items', methods=['GET'])
@jwt_required()
def get_current_user_items():
    """Return items where the current user is either the finder or the claimer."""
    user_id = get_jwt_identity()

    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    items_query = Item.query.filter(
        (Item.user_found_id == user_id) | (Item.user_claimed_id == user_id)
    )

    items = items_query.order_by(Item.created_at.desc()).paginate(page=page, per_page=per_page)

    return jsonify({
        'items': [item.to_dict() for item in items.items],
        'total': items.total,
        'pages': items.pages,
        'current_page': page
    }), 200

@users_bp.route('/<int:user_id>/items/found', methods=['GET'])
@jwt_required()
def get_user_found_items(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own items unless they're admins
    if current_user_id != user_id and not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    items = Item.query.filter_by(user_found_id=user_id).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'items': [item.to_dict() for item in items.items],
        'total': items.total,
        'pages': items.pages,
        'current_page': page
    }), 200

@users_bp.route('/<int:user_id>/items/claimed', methods=['GET'])
@jwt_required()
def get_user_claimed_items(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own items unless they're admins
    if current_user_id != user_id and not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    items = Item.query.filter_by(user_claimed_id=user_id).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'items': [item.to_dict() for item in items.items],
        'total': items.total,
        'pages': items.pages,
        'current_page': page
    }), 200

@users_bp.route('/<int:user_id>/claims', methods=['GET'])
@jwt_required()
def get_user_claims(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own claims unless they're admins
    if current_user_id != user_id and not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    claims = Claim.query.filter_by(user_id=user_id).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'claims': [claim.to_dict() for claim in claims.items],
        'total': claims.total,
        'pages': claims.pages,
        'current_page': page
    }), 200

@users_bp.route('/claims', methods=['GET'])
@jwt_required()
def get_current_user_claims():
    """Return claims created by the current user."""
    user_id = get_jwt_identity()

    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    claims_query = Claim.query.filter_by(user_id=user_id)
    claims = claims_query.order_by(Claim.created_at.desc()).paginate(page=page, per_page=per_page)

    return jsonify({
        'claims': [claim.to_dict() for claim in claims.items],
        'total': claims.total,
        'pages': claims.pages,
        'current_page': page
    }), 200