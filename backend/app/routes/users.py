from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import os
from app.utils.supabase import get_supabase_client

users_bp = Blueprint('users', __name__)
supabase = get_supabase_client()

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    try:
        # Only admins can list all users
        if not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get paginated results
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Calculate start and end for pagination
        start = (page - 1) * per_page
        end = start + per_page - 1

        current_app.logger.info(f"Fetching users with pagination: start={start}, end={end}")

        # Query users from Supabase with pagination
        result = supabase.table('users').select('*').range(start, end).execute()

        # Get total count for pagination
        count_result = supabase.table('users').select('id', count='exact').execute()
        total_count = count_result.count if hasattr(count_result, 'count') else 0

        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 0

        current_app.logger.info(f"Found {len(result.data)} users, total: {total_count}")

        return jsonify({
            'users': result.data,
            'total': total_count,
            'pages': total_pages,
            'current_page': page
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'error': f"Failed to fetch users: {str(e)}"}), 500

@users_bp.route('/<string:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_app.logger.info(f"User {current_user_id} requesting profile for user {user_id}")

        # Users can only view their own profile unless they're admins
        if current_user_id != user_id and not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403

        # Query user from Supabase
        result = supabase.table('users').select('*').eq('id', user_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'User not found'}), 404

        current_app.logger.info(f"Found user: {result.data[0]}")
        return jsonify(result.data[0]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch user: {str(e)}"}), 500

@users_bp.route('/<string:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_app.logger.info(f"User {current_user_id} attempting to update user {user_id}")

        # Users can only update their own profile unless they're admins
        if current_user_id != user_id and not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403

        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        current_app.logger.info(f"Updating user with data: {data}")

        # Only update allowed fields
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'email' in data:
            update_data['email'] = data['email']
        if 'phone' in data:
            update_data['phone'] = data['phone']

        # Update user in Supabase
        result = supabase.table('users').update(update_data).eq('id', user_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404

        current_app.logger.info(f"User updated successfully: {result.data[0]}")
        return jsonify({
            'message': 'User updated successfully',
            'user': result.data[0]
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to update user: {str(e)}"}), 500

@users_bp.route('/<string:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        # Only admins can delete users
        if not is_admin():
            return jsonify({'error': 'Unauthorized access'}), 403

        current_app.logger.info(f"Admin attempting to delete user {user_id}")

        # Check if user exists
        check_result = supabase.table('users').select('id').eq('id', user_id).execute()
        if not check_result.data or len(check_result.data) == 0:
            return jsonify({'error': 'User not found'}), 404

        # Delete user from Supabase
        result = supabase.table('users').delete().eq('id', user_id).execute()

        current_app.logger.info(f"User {user_id} deleted successfully")
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to delete user: {str(e)}"}), 500

@users_bp.route('/me/items', methods=['GET'])
def get_my_items():
    try:
        # Get Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            current_app.logger.error("Unauthorized access: No valid Authorization header provided")
            return jsonify({
                'error': 'Authentication required',
                'message': 'You must be logged in to view your items'
            }), 401

        # Extract token
        token = auth_header.split(' ')[1]

        # Verify token with Supabase
        try:
            from app.utils.supabase_auth import decode_token
            user_info = decode_token(token)
            user_id = user_info.get('id')

            if not user_id:
                current_app.logger.error("Invalid token: Could not extract user ID")
                return jsonify({
                    'error': 'Authentication failed',
                    'message': 'Invalid authentication token'
                }), 401
        except Exception as e:
            current_app.logger.error(f"Token verification failed: {str(e)}")
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid authentication token'
            }), 401

        current_app.logger.info(f"Fetching items for user {user_id}")

        # Get items found by the user from Supabase
        result = supabase.table('items').select('*').eq('user_found_id', user_id).execute()

        current_app.logger.info(f"Found {len(result.data)} items for user {user_id}")
        return jsonify(result.data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching items for user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch items: {str(e)}"}), 500

@users_bp.route('/me/claims', methods=['GET'])
@jwt_required()
def get_my_claims():
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"Fetching claims for user {user_id}")

        # Get claims made by the user from Supabase
        result = supabase.table('claims').select('*, items(*)').eq('user_id', user_id).execute()

        current_app.logger.info(f"Found {len(result.data)} claims for user {user_id}")
        return jsonify(result.data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching claims for user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch claims: {str(e)}"}), 500

@users_bp.route('/me/notifications', methods=['GET'])
@jwt_required()
def get_my_notifications():
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"Fetching notifications for user {user_id}")

        # Get notifications for the user from Supabase, ordered by created_at desc
        result = supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()

        current_app.logger.info(f"Found {len(result.data)} notifications for user {user_id}")
        return jsonify(result.data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching notifications for user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch notifications: {str(e)}"}), 500

@users_bp.route('/profile', methods=['GET'])
@jwt_required(optional=True)
def get_profile():
    try:
        # Get user ID from JWT token
        user_id = get_jwt_identity()

        # Check if user is authenticated
        if not user_id:
            current_app.logger.error("Unauthorized access: No valid JWT token provided")
            return jsonify({
                'error': 'Authentication required',
                'message': 'You must be logged in to view your profile'
            }), 401

        current_app.logger.info(f"Fetching profile for user {user_id}")

        # Query user from Supabase
        result = supabase.table('users').select('*').eq('id', user_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'User not found'}), 404

        # Return user profile without sensitive information
        user_profile = result.data[0]
        if 'password' in user_profile:
            del user_profile['password']

        current_app.logger.info(f"Found profile for user {user_id}")
        return jsonify(user_profile), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching profile: {str(e)}")
        return jsonify({'error': f"Failed to fetch profile: {str(e)}"}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required(optional=True)
def update_profile():
    try:
        # Get user ID from JWT token
        user_id = get_jwt_identity()

        # Check if user is authenticated
        if not user_id:
            current_app.logger.error("Unauthorized access: No valid JWT token provided")
            return jsonify({
                'error': 'Authentication required',
                'message': 'You must be logged in to update your profile'
            }), 401

        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        current_app.logger.info(f"Updating profile for user {user_id} with data: {data}")

        # Only update allowed fields
        update_data = {}
        allowed_fields = ['name', 'email', 'phone', 'bio', 'avatar_url']

        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Update user in Supabase
        result = supabase.table('users').update(update_data).eq('id', user_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404

        # Return updated profile
        updated_profile = result.data[0]
        if 'password' in updated_profile:
            del updated_profile['password']

        current_app.logger.info(f"Profile updated successfully for user {user_id}")
        return jsonify({
            'message': 'Profile updated successfully',
            'user': updated_profile
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': f"Failed to update profile: {str(e)}"}), 500

@users_bp.route('/claims', methods=['GET'])
@jwt_required()
def get_current_user_claims():
    """Return claims created by the current user."""
    try:
        user_id = get_jwt_identity()
        current_app.logger.info(f"Fetching claims for current user {user_id}")

        # Get paginated results
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Calculate start and end for pagination
        start = (page - 1) * per_page
        end = start + per_page - 1

        # Query claims from Supabase with pagination
        result = supabase.table('claims')\
            .select('*, items(*)')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .range(start, end)\
            .execute()

        # Get total count for pagination
        count_result = supabase.table('claims')\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .execute()

        total_count = count_result.count if hasattr(count_result, 'count') else 0

        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 0

        current_app.logger.info(f"Found {len(result.data)} claims for user {user_id}, total: {total_count}")

        return jsonify({
            'claims': result.data,
            'total': total_count,
            'pages': total_pages,
            'current_page': page
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching claims for user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch claims: {str(e)}"}), 500