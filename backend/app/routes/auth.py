from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import db, supabase
from datetime import timedelta
from email_validator import validate_email, EmailNotValidError
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate email format
    try:
        valid = validate_email(data['email'])
        email = valid.email
    except EmailNotValidError as e:
        return jsonify({'error': str(e)}), 400
    
    # Check if user already exists
    existing_user = User.get_by_email(email)
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user in Supabase
    user_data = {
        'name': data['name'],
        'email': email,
        'phone_number': data.get('phone_number', ''),
        'role': 'user',  # Default role
        'password': data['password']  # Will be hashed in the create method
    }
    
    new_user = User.create(user_data)
    
    if not new_user:
        return jsonify({'error': 'Failed to create user'}), 500
    
    # Create access token
    access_token = create_access_token(
        identity=new_user['id'],
        additional_claims={'role': new_user['role']},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': new_user['id'],
            'name': new_user['name'],
            'email': new_user['email'],
            'phone_number': new_user['phone_number'],
            'role': new_user['role'],
            'created_at': new_user['created_at'],
            'updated_at': new_user['updated_at']
        },
        'access_token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Get user from Supabase
    user = User.get_by_email(data['email'])
    
    if not user or not check_password_hash(user['password_hash'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(
        identity=user['id'],
        additional_claims={'role': user['role']},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'phone_number': user['phone_number'],
            'role': user['role'],
            'created_at': user['created_at'],
            'updated_at': user['updated_at']
        },
        'access_token': access_token
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.get_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'phone_number': user['phone_number'],
        'role': user['role'],
        'created_at': user['created_at'],
        'updated_at': user['updated_at']
    }), 200

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.get_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not all(k in data for k in ('current_password', 'new_password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not check_password_hash(user['password_hash'], data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password in Supabase
    from werkzeug.security import generate_password_hash
    password_hash = generate_password_hash(data['new_password'])
    
    updated_user = User.update(user_id, {'password_hash': password_hash})
    
    if not updated_user:
        return jsonify({'error': 'Failed to update password'}), 500
    
    return jsonify({'message': 'Password changed successfully'}), 200