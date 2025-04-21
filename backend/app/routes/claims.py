from flask import Blueprint, request, jsonify, current_app, g
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from app.utils.supabase import get_supabase_client
from app.utils.supabase_auth import supabase_auth_required, supabase_auth_optional, get_current_user

claims_bp = Blueprint('claims', __name__)
supabase = get_supabase_client()

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@claims_bp.route('', methods=['GET'])
@supabase_auth_required
def get_claims():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Only admins can see all claims
        if user.get('role') != 'admin':
            # Regular users can only see their own claims
            result = supabase.table('claims').select('*').eq('user_id', user_id).execute()

            if not result.data:
                return jsonify({'claims': [], 'total': 0, 'pages': 0, 'current_page': 1}), 200

            return jsonify({
                'claims': result.data,
                'total': len(result.data),
                'pages': 1,
                'current_page': 1
            }), 200

        # Admins can see all claims with filtering
        status = request.args.get('status')

        # Start with base query
        query = supabase.table('claims').select('*')

        # Apply filters if provided
        if status:
            query = query.eq('verification_status', status)

        # Apply pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Calculate start and end for pagination
        start = (page - 1) * per_page
        end = start + per_page - 1

        # Add pagination to query
        query = query.range(start, end)

        # Execute query
        result = query.execute()

        # Get total count
        count_result = supabase.table('claims').select('id', count='exact').execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(result.data)

        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1

        claims = result.data

        return jsonify({
            'claims': claims,
            'total': total_count,
            'pages': total_pages,
            'current_page': page
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching claims: {str(e)}")
        return jsonify({'error': f"Failed to fetch claims: {str(e)}"}), 500

@claims_bp.route('/<claim_id>', methods=['GET'])
@supabase_auth_required
def get_claim(claim_id):
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Get claim from Supabase
        result = supabase.table('claims').select('*').eq('id', claim_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Claim not found'}), 404

        claim = result.data[0]

        # Users can only view their own claims unless they're admins
        if claim.get('user_id') != user_id and user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        return jsonify(claim), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching claim {claim_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch claim: {str(e)}"}), 500

@claims_bp.route('', methods=['POST'])
@supabase_auth_required
def create_claim():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        data = request.get_json()

        # Validate required fields
        if 'item_id' not in data:
            return jsonify({'error': 'Item ID is required'}), 400

        # Check if item exists
        item_result = supabase.table('items').select('*').eq('id', data['item_id']).execute()

        if not item_result.data or len(item_result.data) == 0:
            return jsonify({'error': 'Item not found'}), 404

        item = item_result.data[0]

        # Check if item is already claimed
        if item.get('status') == 'claimed' or item.get('status') == 'returned':
            return jsonify({'error': 'This item has already been claimed'}), 400

        # Check if user already has a pending claim for this item
        existing_claim_result = supabase.table('claims').select('*').eq('item_id', data['item_id']).eq('user_id', user_id).execute()

        if existing_claim_result.data and len(existing_claim_result.data) > 0:
            return jsonify({'error': 'You already have a claim for this item'}), 400

        # Create new claim
        claim_data = {
            'item_id': data['item_id'],
            'user_id': user_id,
            'proof_description': data.get('proof_description', ''),
            'verification_status': 'pending',
            'claim_date': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        # Insert into Supabase
        claim_result = supabase.table('claims').insert(claim_data).execute()

        if not claim_result.data or len(claim_result.data) == 0:
            return jsonify({'error': 'Failed to create claim'}), 500

        claim = claim_result.data[0]

        # Create notification for admin
        # Find admin users
        admin_result = supabase.table('users').select('id').eq('role', 'admin').execute()

        if admin_result.data and len(admin_result.data) > 0:
            for admin in admin_result.data:
                notification_data = {
                    'user_id': admin.get('id'),
                    'item_id': item.get('id'),
                    'message': f"New claim submitted for item '{item.get('name')}'",
                    'notification_type': 'claim_update',
                    'created_at': datetime.utcnow().isoformat(),
                    'read': False
                }

                supabase.table('notifications').insert(notification_data).execute()

        # Create notification for the finder
        if item.get('user_found_id'):
            notification_data = {
                'user_id': item.get('user_found_id'),
                'item_id': item.get('id'),
                'message': f"Someone has claimed the item '{item.get('name')}' that you found",
                'notification_type': 'claim_update',
                'created_at': datetime.utcnow().isoformat(),
                'read': False
            }

            supabase.table('notifications').insert(notification_data).execute()

        return jsonify({
            'message': 'Claim submitted successfully',
            'claim': claim
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating claim: {str(e)}")
        return jsonify({'error': f"Failed to create claim: {str(e)}"}), 500

@claims_bp.route('/<claim_id>', methods=['PUT'])
@supabase_auth_required
def update_claim(claim_id):
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Get claim from Supabase
        claim_result = supabase.table('claims').select('*').eq('id', claim_id).execute()

        if not claim_result.data or len(claim_result.data) == 0:
            return jsonify({'error': 'Claim not found'}), 404

        claim = claim_result.data[0]

        data = request.get_json()

        # Regular users can only update their own claims' proof description
        if claim.get('user_id') == user_id and user.get('role') != 'admin':
            if 'proof_description' in data:
                update_data = {
                    'proof_description': data['proof_description'],
                    'updated_at': datetime.utcnow().isoformat()
                }

                update_result = supabase.table('claims').update(update_data).eq('id', claim_id).execute()

                if not update_result.data or len(update_result.data) == 0:
                    return jsonify({'error': 'Failed to update claim'}), 500

                return jsonify({
                    'message': 'Claim updated successfully',
                    'claim': update_result.data[0]
                }), 200
            else:
                return jsonify({'error': 'Unauthorized to update these fields'}), 403

        # Admins can update verification status and notes
        if user.get('role') == 'admin':
            update_data = {
                'updated_at': datetime.utcnow().isoformat()
            }

            if 'verification_status' in data:
                old_status = claim.get('verification_status')
                new_status = data['verification_status']
                update_data['verification_status'] = new_status

                # If claim is verified, update the item status
                if new_status == 'verified' and old_status != 'verified':
                    item_result = supabase.table('items').select('*').eq('id', claim.get('item_id')).execute()

                    if item_result.data and len(item_result.data) > 0:
                        item = item_result.data[0]

                        item_update = {
                            'status': 'claimed',
                            'user_claimed_id': claim.get('user_id'),
                            'updated_at': datetime.utcnow().isoformat()
                        }

                        supabase.table('items').update(item_update).eq('id', claim.get('item_id')).execute()

                        # Create notification for the claimer
                        notification_data = {
                            'user_id': claim.get('user_id'),
                            'item_id': item.get('id'),
                            'message': f"Your claim for '{item.get('name')}' has been verified. You can now pick it up.",
                            'notification_type': 'claim_update',
                            'created_at': datetime.utcnow().isoformat(),
                            'read': False
                        }

                        supabase.table('notifications').insert(notification_data).execute()

                # If claim is rejected, notify the user
                if new_status == 'rejected' and old_status != 'rejected':
                    item_result = supabase.table('items').select('*').eq('id', claim.get('item_id')).execute()

                    if item_result.data and len(item_result.data) > 0:
                        item = item_result.data[0]

                        notification_data = {
                            'user_id': claim.get('user_id'),
                            'item_id': item.get('id'),
                            'message': f"Your claim for '{item.get('name')}' has been rejected.",
                            'notification_type': 'claim_update',
                            'created_at': datetime.utcnow().isoformat(),
                            'read': False
                        }

                        supabase.table('notifications').insert(notification_data).execute()

            if 'admin_notes' in data:
                update_data['admin_notes'] = data['admin_notes']

            update_result = supabase.table('claims').update(update_data).eq('id', claim_id).execute()

            if not update_result.data or len(update_result.data) == 0:
                return jsonify({'error': 'Failed to update claim'}), 500

            return jsonify({
                'message': 'Claim updated successfully',
                'claim': update_result.data[0]
            }), 200

        return jsonify({'error': 'Unauthorized access'}), 403
    except Exception as e:
        current_app.logger.error(f"Error updating claim {claim_id}: {str(e)}")
        return jsonify({'error': f"Failed to update claim: {str(e)}"}), 500

@claims_bp.route('/<claim_id>', methods=['DELETE'])
@supabase_auth_required
def delete_claim(claim_id):
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Get claim from Supabase
        claim_result = supabase.table('claims').select('*').eq('id', claim_id).execute()

        if not claim_result.data or len(claim_result.data) == 0:
            return jsonify({'error': 'Claim not found'}), 404

        claim = claim_result.data[0]

        # Users can only delete their own pending claims, admins can delete any
        if (claim.get('user_id') == user_id and claim.get('verification_status') == 'pending') or user.get('role') == 'admin':
            delete_result = supabase.table('claims').delete().eq('id', claim_id).execute()

            if not delete_result.data or len(delete_result.data) == 0:
                return jsonify({'error': 'Failed to delete claim'}), 500

            return jsonify({'message': 'Claim deleted successfully'}), 200

        return jsonify({'error': 'Unauthorized to delete this claim'}), 403
    except Exception as e:
        current_app.logger.error(f"Error deleting claim {claim_id}: {str(e)}")
        return jsonify({'error': f"Failed to delete claim: {str(e)}"}), 500