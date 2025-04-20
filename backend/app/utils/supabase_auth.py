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
        # Get Supabase JWT secret from environment or use a default for development
        jwt_secret = os.environ.get('SUPABASE_JWT_SECRET')
        
        if not jwt_secret:
            # If no JWT secret is available, try to verify with Supabase client
            try:
                # This will throw an error if the token is invalid
                user = supabase.auth.get_user(token)
                return user.data.user
            except Exception as e:
                current_app.logger.error(f"Error verifying token with Supabase: {str(e)}")
                return None
        
        # Decode the token
        decoded = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        
        # Extract user info from the token
        user_id = decoded.get('sub')
        if not user_id:
            return None
        
        # Get additional user info if needed
        user_info = {
            'id': user_id,
            'email': decoded.get('email', ''),
            'role': decoded.get('role', 'user')
        }
        
        return user_info
    except jwt.ExpiredSignatureError:
        current_app.logger.error("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        current_app.logger.error(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        current_app.logger.error(f"Error verifying token: {str(e)}")
        return None

def supabase_auth_required(fn):
    """Decorator to require Supabase authentication"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # First try to get token from header
        token = get_token_from_header()
        if not token:
            return jsonify({'error': 'Missing authentication token'}), 401
        
        # Verify the token
        user_info = verify_supabase_token(token)
        if not user_info:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Store user info in Flask's g object for the current request
        g.user = user_info
        
        # Call the original function
        return fn(*args, **kwargs)
    
    return wrapper

def get_current_user():
    """Get the current authenticated user from g object"""
    return getattr(g, 'user', None)

def is_admin():
    """Check if the current user is an admin"""
    user = get_current_user()
    if not user:
        return False
    return user.get('role') == 'admin'
