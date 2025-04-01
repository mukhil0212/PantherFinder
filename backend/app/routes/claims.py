from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.claim import Claim
from app.models.item import Item
from app.models.notification import Notification
from app.models.user import User
from app import db
from datetime import datetime

claims_bp = Blueprint('claims', __name__)

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@claims_bp.route('/', methods=['GET'])
@jwt_required()
def get_claims():
    # Only admins can see all claims
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Get query parameters for filtering
    status = request.args.get('status')
    
    # Start with base query
    query = Claim.query
    
    # Apply filters if provided
    if status:
        query = query.filter(Claim.verification_status == status)
    
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    claims = query.order_by(Claim.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'claims': [claim.to_dict() for claim in claims.items],
        'total': claims.total,
        'pages': claims.pages,
        'current_page': page
    }), 200

@claims_bp.route('/<int:claim_id>', methods=['GET'])
@jwt_required()
def get_claim(claim_id):
    user_id = get_jwt_identity()
    claim = Claim.query.get_or_404(claim_id)
    
    # Users can only view their own claims unless they're admins
    if claim.user_id != user_id and not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify(claim.to_dict()), 200

@claims_bp.route('/', methods=['POST'])
@jwt_required()
def create_claim():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if 'item_id' not in data:
        return jsonify({'error': 'Item ID is required'}), 400
    
    # Check if item exists
    item = Item.query.get(data['item_id'])
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    # Check if item is already claimed
    if item.status == 'claimed' or item.status == 'returned':
        return jsonify({'error': 'This item has already been claimed'}), 400
    
    # Check if user already has a pending claim for this item
    existing_claim = Claim.query.filter_by(
        item_id=data['item_id'],
        user_id=user_id
    ).first()
    
    if existing_claim:
        return jsonify({'error': 'You already have a claim for this item'}), 400
    
    # Create new claim
    claim = Claim(
        item_id=data['item_id'],
        user_id=user_id,
        proof_description=data.get('proof_description', ''),
        verification_status='pending'
    )
    
    db.session.add(claim)
    
    # Create notification for admin
    # Find admin users
    admins = User.query.filter_by(role='admin').all()
    for admin in admins:
        notification = Notification(
            user_id=admin.id,
            item_id=item.id,
            message=f"New claim submitted for item '{item.name}'",
            notification_type='claim_update'
        )
        db.session.add(notification)
    
    # Create notification for the finder
    if item.user_found_id:
        notification = Notification(
            user_id=item.user_found_id,
            item_id=item.id,
            message=f"Someone has claimed the item '{item.name}' that you found",
            notification_type='claim_update'
        )
        db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Claim submitted successfully',
        'claim': claim.to_dict()
    }), 201

@claims_bp.route('/<int:claim_id>', methods=['PUT'])
@jwt_required()
def update_claim(claim_id):
    user_id = get_jwt_identity()
    claim = Claim.query.get_or_404(claim_id)
    data = request.get_json()
    
    # Regular users can only update their own claims' proof description
    if claim.user_id == user_id and not is_admin():
        if 'proof_description' in data:
            claim.proof_description = data['proof_description']
            db.session.commit()
            return jsonify({
                'message': 'Claim updated successfully',
                'claim': claim.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Unauthorized to update these fields'}), 403
    
    # Admins can update verification status and notes
    if is_admin():
        if 'verification_status' in data:
            old_status = claim.verification_status
            new_status = data['verification_status']
            claim.verification_status = new_status
            
            # If claim is verified, update the item status
            if new_status == 'verified' and old_status != 'verified':
                item = Item.query.get(claim.item_id)
                if item:
                    item.status = 'claimed'
                    item.user_claimed_id = claim.user_id
                    
                    # Create notification for the claimer
                    notification = Notification(
                        user_id=claim.user_id,
                        item_id=item.id,
                        message=f"Your claim for '{item.name}' has been verified. You can now pick it up.",
                        notification_type='claim_update'
                    )
                    db.session.add(notification)
            
            # If claim is rejected, notify the user
            if new_status == 'rejected' and old_status != 'rejected':
                item = Item.query.get(claim.item_id)
                if item:
                    notification = Notification(
                        user_id=claim.user_id,
                        item_id=item.id,
                        message=f"Your claim for '{item.name}' has been rejected.",
                        notification_type='claim_update'
                    )
                    db.session.add(notification)
        
        if 'admin_notes' in data:
            claim.admin_notes = data['admin_notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Claim updated successfully',
            'claim': claim.to_dict()
        }), 200
    
    return jsonify({'error': 'Unauthorized access'}), 403

@claims_bp.route('/<int:claim_id>', methods=['DELETE'])
@jwt_required()
def delete_claim(claim_id):
    user_id = get_jwt_identity()
    claim = Claim.query.get_or_404(claim_id)
    
    # Users can only delete their own pending claims, admins can delete any
    if (claim.user_id == user_id and claim.verification_status == 'pending') or is_admin():
        db.session.delete(claim)
        db.session.commit()
        
        return jsonify({'message': 'Claim deleted successfully'}), 200
    
    return jsonify({'error': 'Unauthorized to delete this claim'}), 403