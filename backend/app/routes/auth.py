from flask import Blueprint, request, jsonify, current_app, g
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import db, supabase
from app.utils.supabase import sign_up, sign_in, get_user, update_user
from app.utils.supabase_auth import supabase_auth_required, get_current_user
from datetime import timedelta
from email_validator import validate_email, EmailNotValidError
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        current_app.logger.info('Register endpoint called')
        data = request.get_json()
        current_app.logger.info(f'Register data: {data}')

        # Validate required fields
        if not all(k in data for k in ('name', 'email', 'password')):
            current_app.logger.error('Missing required fields')
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate email format
        try:
            valid = validate_email(data['email'])
            email = valid.email
        except EmailNotValidError as e:
            current_app.logger.error(f'Email validation error: {str(e)}')
            return jsonify({'error': str(e)}), 400

        # Create user metadata
        user_metadata = {
            'name': data['name'],
            'phone_number': data.get('phone_number', ''),
            'role': 'user'  # Default role
        }
        current_app.logger.info(f'User metadata: {user_metadata}')

        # Register user with Supabase Auth
        current_app.logger.info('Calling Supabase sign_up')
        auth_response = sign_up(email, data['password'], user_metadata)
        current_app.logger.info(f'Supabase sign_up response: {auth_response}')

        if auth_response.error:
            current_app.logger.error(f'Supabase auth error: {auth_response.error.message}')
            return jsonify({'error': auth_response.error.message}), 400
    except Exception as e:
        current_app.logger.error(f'Exception in register: {str(e)}')
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': f'Server error: {str(e)}'}), 500

    # Get the new user data
    new_user = auth_response.data.user

    # Create a profile record in the profiles table
    profile_data = {
        'id': new_user.id,
        'name': data['name'],
        'email': email,
        'phone_number': data.get('phone_number', ''),
        'role': 'user'
    }

    profile_response = supabase.table('profiles').insert(profile_data).execute()

    if hasattr(profile_response, 'error') and profile_response.error:
        return jsonify({'error': 'User created but profile setup failed'}), 500

    # Create access token for the API
    access_token = create_access_token(
        identity=new_user.id,
        additional_claims={'role': 'user'},
        expires_delta=timedelta(days=1)
    )

    # Format user data for response
    user_data = {
        'id': new_user.id,
        'name': data['name'],
        'email': email,
        'phone_number': data.get('phone_number', ''),
        'role': 'user',
        'created_at': new_user.created_at,
        'updated_at': new_user.created_at
    }

    return jsonify({
        'message': 'User registered successfully',
        'user': user_data,
        'access_token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Missing email or password'}), 400

    # Sign in with Supabase Auth
    auth_response = sign_in(data['email'], data['password'])

    if auth_response.error:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Get user data
    user = auth_response.data.user

    # Get profile data from profiles table
    profile_response = supabase.table('profiles').select('*').eq('id', user.id).execute()

    if hasattr(profile_response, 'error') and profile_response.error:
        return jsonify({'error': 'Authentication successful but profile retrieval failed'}), 500

    profile = profile_response.data[0] if profile_response.data else None

    # Create access token for the API
    access_token = create_access_token(
        identity=user.id,
        additional_claims={'role': profile.get('role', 'user') if profile else 'user'},
        expires_delta=timedelta(days=1)
    )

    # Format user data for response
    user_data = {
        'id': user.id,
        'name': profile.get('name', '') if profile else user.user_metadata.get('name', ''),
        'email': user.email,
        'phone_number': profile.get('phone_number', '') if profile else user.user_metadata.get('phone_number', ''),
        'role': profile.get('role', 'user') if profile else user.user_metadata.get('role', 'user'),
        'created_at': user.created_at,
        'updated_at': user.updated_at
    }

    return jsonify({
        'message': 'Login successful',
        'user': user_data,
        'access_token': access_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user_info():
    # Try to get token from Authorization header
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return jsonify({'error': 'Missing authentication token'}), 401

    # Check if it's a Bearer token
    parts = auth_header.split()
    if parts[0].lower() != 'bearer' or len(parts) != 2:
        return jsonify({'error': 'Invalid authorization header format'}), 401

    token = parts[1]

    # First try to verify as a Supabase token
    try:
        # Get user from Supabase
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        user_id = user.id
    except Exception as e:
        # If Supabase verification fails, try JWT
        try:
            from flask_jwt_extended import decode_token
            decoded = decode_token(token)
            user_id = decoded['sub']
        except Exception as jwt_e:
            current_app.logger.error(f"Token verification failed: {str(e)}, JWT error: {str(jwt_e)}")
            return jsonify({'error': 'Invalid or expired token'}), 401

    # Get user data from Supabase Auth
    auth_response = get_user(user_id)

    if auth_response.error:
        return jsonify({'error': 'User not found'}), 404

    user = auth_response.data

    # Get profile data from profiles table
    profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()

    if hasattr(profile_response, 'error') and profile_response.error:
        return jsonify({'error': 'Profile retrieval failed'}), 500

    profile = profile_response.data[0] if profile_response.data else None

    # Format user data for response
    user_data = {
        'id': user.id,
        'name': profile.get('name', '') if profile else user.user_metadata.get('name', ''),
        'email': user.email,
        'phone_number': profile.get('phone_number', '') if profile else user.user_metadata.get('phone_number', ''),
        'role': profile.get('role', 'user') if profile else user.user_metadata.get('role', 'user'),
        'created_at': user.created_at,
        'updated_at': user.updated_at
    }

    return jsonify(user_data), 200

@auth_bp.route('/profile', methods=['GET', 'OPTIONS'])
def get_profile():
    # Use the same token verification logic as in get_current_user_info
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return jsonify({'error': 'Missing authentication token'}), 401

    parts = auth_header.split()
    if parts[0].lower() != 'bearer' or len(parts) != 2:
        return jsonify({'error': 'Invalid authorization header format'}), 401

    token = parts[1]

    # First try to verify as a Supabase token
    try:
        # Get user from Supabase
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        user_id = user.id
    except Exception as e:
        # If Supabase verification fails, try JWT
        try:
            from flask_jwt_extended import decode_token
            decoded = decode_token(token)
            user_id = decoded['sub']
        except Exception as jwt_e:
            current_app.logger.error(f"Token verification failed: {str(e)}, JWT error: {str(jwt_e)}")
            return jsonify({'error': 'Invalid or expired token'}), 401

    # Get user data from Supabase Auth
    auth_response = get_user(user_id)

    if auth_response.error:
        return jsonify({'error': 'User not found'}), 404

    user = auth_response.data

    # Get profile data from profiles table
    profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()

    if hasattr(profile_response, 'error') and profile_response.error:
        return jsonify({'error': 'Profile retrieval failed'}), 500

    profile = profile_response.data[0] if profile_response.data else None

    # Format user data for response
    user_data = {
        'id': user.id,
        'name': profile.get('name', '') if profile else user.user_metadata.get('name', ''),
        'email': user.email,
        'phone_number': profile.get('phone_number', '') if profile else user.user_metadata.get('phone_number', ''),
        'role': profile.get('role', 'user') if profile else user.user_metadata.get('role', 'user'),
        'created_at': user.created_at,
        'updated_at': user.updated_at
    }

    return jsonify(user_data), 200

@auth_bp.route('/change-password', methods=['PUT'])
def change_password():
    # Use the same token verification logic as in get_current_user_info
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return jsonify({'error': 'Missing authentication token'}), 401

    parts = auth_header.split()
    if parts[0].lower() != 'bearer' or len(parts) != 2:
        return jsonify({'error': 'Invalid authorization header format'}), 401

    token = parts[1]

    # First try to verify as a Supabase token
    try:
        # Get user from Supabase
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        user_id = user.id
    except Exception as e:
        # If Supabase verification fails, try JWT
        try:
            from flask_jwt_extended import decode_token
            decoded = decode_token(token)
            user_id = decoded['sub']
        except Exception as jwt_e:
            current_app.logger.error(f"Token verification failed: {str(e)}, JWT error: {str(jwt_e)}")
            return jsonify({'error': 'Invalid or expired token'}), 401

    data = request.get_json()

    if not all(k in data for k in ('current_password', 'new_password')):
        return jsonify({'error': 'Missing required fields'}), 400

    # First verify the current password by attempting to sign in
    auth_response = sign_in(data.get('email', ''), data['current_password'])

    if auth_response.error:
        return jsonify({'error': 'Current password is incorrect'}), 401

    # Update password in Supabase Auth
    update_response = supabase.auth.admin.update_user_by_id(
        user_id,
        {'password': data['new_password']}
    )

    if update_response.error:
        return jsonify({'error': 'Failed to update password'}), 500

    return jsonify({'message': 'Password changed successfully'}), 200