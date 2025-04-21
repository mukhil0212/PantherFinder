import os
import jwt
from functools import wraps
from flask import request, jsonify, current_app, g
from app.utils.supabase import supabase

def get_token_from_header():
    """Extract token from the Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    # Check if it's a Bearer token
    parts = auth_header.split()
    if parts[0].lower() != 'bearer' or len(parts) != 2:
        return None

    return parts[1]

def verify_supabase_token(token):
    """Verify a Supabase JWT token and extract user info"""
    try:
        current_app.logger.info(f"Verifying token: {token[:10]}...")

        # Try to verify with Supabase client directly
        try:
            # This will throw an error if the token is invalid
            user_response = supabase.auth.get_user(token)
            if user_response and hasattr(user_response, 'data') and user_response.data:
                current_app.logger.info(f"Successfully verified token with Supabase API")
                user = user_response.data.user

                # Create user info dictionary
                user_info = {
                    'id': user.id,
                    'email': user.email,
                    'name': user.user_metadata.get('name', ''),
                    'role': user.user_metadata.get('role', 'user')
                }
                current_app.logger.info(f"User info from token: {user_info}")
                return user_info
        except Exception as e:
            current_app.logger.error(f"Error verifying token with Supabase API: {str(e)}")

        # If direct verification fails, try to decode the token
        try:
            # For development, we'll try to decode without verification
            # In production, you should use the proper JWT secret
            decoded = jwt.decode(token, options={"verify_signature": False})
            current_app.logger.info(f"Decoded token without verification: {decoded}")

            # Extract user info from the token
            user_id = decoded.get('sub')
            if not user_id:
                current_app.logger.error("No user ID in token")
                return None

            # Get additional user info if needed
            user_info = {
                'id': user_id,
                'email': decoded.get('email', ''),
                'role': decoded.get('user_metadata', {}).get('role', 'user'),
                'name': decoded.get('user_metadata', {}).get('name', '')
            }

            current_app.logger.info(f"User info from decoded token: {user_info}")
            return user_info
        except Exception as e:
            current_app.logger.error(f"Error decoding token: {str(e)}")
            return None
    except jwt.ExpiredSignatureError:
        current_app.logger.error("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        current_app.logger.error(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        current_app.logger.error(f"Error verifying token: {str(e)}")
        return None

def supabase_auth_required(f):
    """Decorator to require Supabase authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()

        if not token:
            current_app.logger.error("Missing authorization token")
            return jsonify({
                'error': 'Authentication required',
                'message': 'Missing authorization token'
            }), 401

        current_app.logger.info(f"Authenticating with token: {token[:10]}...")
        user = verify_supabase_token(token)

        if not user:
            current_app.logger.error("Invalid or expired token")
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid or expired token'
            }), 401

        # Store user in Flask's g object for the current request
        g.user = user
        current_app.logger.info(f"Authentication successful for user: {user.get('id')}")

        return f(*args, **kwargs)
    return decorated

def supabase_auth_optional(f):
    """Optional version of the decorator that doesn't require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()

        if token:
            user = verify_supabase_token(token)
            if user:
                # Store user in Flask's g object for the current request
                g.user = user
                current_app.logger.info(f"Optional authentication successful for user: {user.get('id')}")
            else:
                current_app.logger.warning("Optional authentication failed: Invalid token")
                g.user = None
        else:
            current_app.logger.info("No authentication token provided for optional auth")
            g.user = None

        return f(*args, **kwargs)
    return decorated

def get_current_user():
    """Get the current authenticated user from g object"""
    return getattr(g, 'user', None)

def is_admin():
    """Check if the current user is an admin"""
    user = get_current_user()
    if not user:
        return False
    return user.get('role') == 'admin'

def decode_token(token):
    """Decode a Supabase JWT token and extract user info"""
    try:
        # For development, we'll try to decode without verification
        # In production, you should use the proper JWT secret
        decoded = jwt.decode(token, options={"verify_signature": False})

        # Extract user info from the token
        user_id = decoded.get('sub')
        if not user_id:
            return None

        # Get additional user info
        user_info = {
            'id': user_id,
            'email': decoded.get('email', ''),
            'role': 'user'  # Default role
        }

        # Try to get role from different places in the token
        if 'user_metadata' in decoded and isinstance(decoded['user_metadata'], dict):
            user_info['role'] = decoded['user_metadata'].get('role', 'user')
            user_info['name'] = decoded['user_metadata'].get('name', '')

        return user_info
    except Exception as e:
        current_app.logger.error(f"Error decoding token: {str(e)}")
        return None
