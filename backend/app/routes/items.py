from flask import Blueprint, request, jsonify, current_app, g
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from app.utils.supabase import get_supabase_client
from app.utils.supabase_auth import supabase_auth_required, supabase_auth_optional, get_current_user

items_bp = Blueprint('items', __name__)
supabase = get_supabase_client()

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

# Helper function to save uploaded image
def save_image(file):
    if not file:
        return None

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')

    # Create directory if it doesn't exist
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)

    # Return relative path for database storage
    return f"/static/uploads/{unique_filename}"

@items_bp.route('', methods=['GET'])
@supabase_auth_optional
def get_items():
    try:
        # Get query parameters for filtering
        category = request.args.get('category')
        status = request.args.get('status')
        search = request.args.get('search')

        # Start with base query
        query = supabase.table('items').select('*')

        # Apply filters if provided
        if category:
            query = query.eq('category', category)

        if status:
            query = query.eq('status', status)

        if search:
            # Supabase doesn't support ILIKE directly, but we can use the 'ilike' function
            # This is a simplification - in production you might want to use more advanced search
            query = query.ilike('name', f'%{search}%')

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

        # Get total count (this would be a separate query in Supabase)
        count_result = supabase.table('items').select('id', count='exact').execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(result.data)

        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1

        items = result.data

        return jsonify({
            'items': items,
            'total': total_count,
            'pages': total_pages,
            'current_page': page
        }), 200
    except Exception as e:
        print(f"Error fetching items: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch items: {str(e)}'}), 500

@items_bp.route('/<item_id>', methods=['GET'])
@supabase_auth_optional
def get_item(item_id):
    try:
        # Get item from Supabase
        result = supabase.table('items').select('*').eq('id', item_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Item not found'}), 404

        return jsonify(result.data[0]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching item {item_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch item: {str(e)}"}), 500

@items_bp.route('/my-items', methods=['GET'])
@supabase_auth_required
def get_my_items():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')
        current_app.logger.info(f"Fetching items for user {user_id}")

        # Get items from Supabase
        result = supabase.table('items').select('*').eq('user_id', user_id).execute()

        # Return empty array instead of 404 when no items found
        items = result.data if result.data else []

        return jsonify({
            'items': items,
            'total': len(items)
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching items for user {user_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch items: {str(e)}"}), 500

@items_bp.route('', methods=['POST'])
@supabase_auth_required
def create_item():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')
        current_app.logger.info(f"User {user_id} is submitting an item")

        # No need to check user_id since supabase_auth_required already did that
        current_app.logger.info(f"Authenticated user {user_id} is submitting an item")

        current_app.logger.info(f"Processing item creation for user: {user_id}")

        # Handle multipart/form-data
        data = request.form.to_dict()
        current_app.logger.info(f"Received form data: {data}")

        image = request.files.get('image')
        if image:
            current_app.logger.info(f"Received image: {image.filename}")

        # Validate required fields
        if 'name' not in data:
            return jsonify({'error': 'Item name is required'}), 400

        # Save image if provided
        image_path = save_image(image) if image else None
        current_app.logger.info(f"Image path: {image_path}")

        # Prepare item data for Supabase
        item_data = {
            'name': data['name'],
            'category': data.get('category', ''),
            'description': data.get('description', ''),
            'image_url': image_path,  # Use image_url field instead of image_path
            'created_at': datetime.utcnow().isoformat(),  # Use created_at field to match Supabase schema
            'status': 'found',
            'found_location': data.get('location', ''),  # Use found_location instead of location
            'found_date': data.get('date_found', datetime.utcnow().isoformat()),  # Add found_date
            'user_id': user_id,  # Use user_id field to match Supabase schema
            'contact_email': data.get('contact_email', ''),
            'contact_phone': data.get('contact_phone', '')
        }

        current_app.logger.info(f"Inserting item data into Supabase: {item_data}")

        # Insert into Supabase
        result = supabase.table('items').insert(item_data).execute()

        # Check for errors
        if hasattr(result, 'error') and result.error:
            current_app.logger.error(f"Supabase error: {result.error}")
            return jsonify({'error': f"Database error: {result.error}"}), 500

        # Get the created item
        created_item = result.data[0] if result.data else None
        current_app.logger.info(f"Item created successfully: {created_item}")

        # Create a notification in Supabase
        if created_item:
            notification_data = {
                'user_id': user_id,
                'related_id': created_item.get('id'),  # Use related_id instead of item_id
                'title': 'New Item Found',
                'message': f"New item '{data['name']}' has been added to the lost and found system.",
                'type': 'item_found',
                'created_at': datetime.utcnow().isoformat(),
                'read': False
            }

            current_app.logger.info(f"Creating notification: {notification_data}")
            notification_result = supabase.table('notifications').insert(notification_data).execute()

            if hasattr(notification_result, 'error') and notification_result.error:
                current_app.logger.error(f"Notification creation error: {notification_result.error}")

        return jsonify({
            'message': 'Item created successfully',
            'item': created_item
        }), 201

    except Exception as e:
        current_app.logger.error(f"Error creating item: {str(e)}")
        return jsonify({'error': f"Failed to create item: {str(e)}"}), 500

@items_bp.route('/<item_id>', methods=['PUT'])
@supabase_auth_required
def update_item(item_id):
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Get item from Supabase
        result = supabase.table('items').select('*').eq('id', item_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Item not found'}), 404

        item = result.data[0]

        # Check if user is the owner or an admin
        if item.get('user_id') != user_id and user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Update item with request data
        data = request.get_json()

        # Only update allowed fields
        update_data = {}
        for field in ['name', 'category', 'description', 'status']:
            if field in data:
                update_data[field] = data[field]

        # Handle location field separately (maps to found_location in DB)
        if 'location' in data:
            update_data['found_location'] = data['location']

        # Handle date fields
        if 'date_found' in data:
            update_data['found_date'] = data['date_found']

        if 'date_lost' in data:
            update_data['date_lost'] = data['date_lost']

        # Handle contact information
        if 'contact_email' in data:
            update_data['contact_email'] = data['contact_email']

        if 'contact_phone' in data:
            update_data['contact_phone'] = data['contact_phone']

        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Update in Supabase
        update_result = supabase.table('items').update(update_data).eq('id', item_id).execute()

        if not update_result.data or len(update_result.data) == 0:
            return jsonify({'error': 'Failed to update item'}), 500

        return jsonify({
            'message': 'Item updated successfully',
            'item': update_result.data[0]
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating item {item_id}: {str(e)}")
        return jsonify({'error': f"Failed to update item: {str(e)}"}), 500

@items_bp.route('/<item_id>', methods=['DELETE'])
@supabase_auth_required
def delete_item(item_id):
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Get item from Supabase
        result = supabase.table('items').select('*').eq('id', item_id).execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Item not found'}), 404

        item = result.data[0]

        # Check if user is the owner or an admin
        if item.get('user_id') != user_id and user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Delete item from Supabase
        delete_result = supabase.table('items').delete().eq('id', item_id).execute()

        if not delete_result.data or len(delete_result.data) == 0:
            return jsonify({'error': 'Failed to delete item'}), 500

        return jsonify({
            'message': 'Item deleted successfully'
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting item {item_id}: {str(e)}")
        return jsonify({'error': f"Failed to delete item: {str(e)}"}), 500

@items_bp.route('/categories', methods=['GET'])
@supabase_auth_optional
def get_categories():
    try:
        # Get distinct categories from Supabase
        result = supabase.table('items').select('category').distinct().execute()

        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'No categories found'}), 404

        categories = [item.get('category') for item in result.data]

        return jsonify({'categories': categories}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching categories: {str(e)}")
        return jsonify({'error': f"Failed to fetch categories: {str(e)}"}), 500

@items_bp.route('/lost', methods=['POST'])
@supabase_auth_required
def create_lost_item():
    try:
        # Get user from g object (set by supabase_auth_required)
        user = g.user
        user_id = user.get('id')

        # Get form data and files
        data = {}
        for key in request.form:
            data[key] = request.form[key]
            current_app.logger.info(f"Form field {key}: {data[key]}")

        # Get image file if provided
        image = None
        if 'image' in request.files:
            image = request.files['image']
            current_app.logger.info(f"Received image: {image.filename}")

        # Validate required fields
        if 'name' not in data:
            return jsonify({'error': 'Item name is required'}), 400

        # Save image if provided
        image_path = save_image(image) if image else None
        current_app.logger.info(f"Image path: {image_path}")

        # Prepare item data for Supabase
        item_data = {
            'name': data['name'],
            'category': data.get('category', ''),
            'description': data.get('description', ''),
            'image_url': image_path,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'lost',  # Set status as lost
            'found_location': data.get('location', ''),  # Use found_location instead of location
            'date_lost': data.get('date_lost', datetime.utcnow().isoformat()),  # Use date_lost for lost items
            'user_id': user_id,
            'contact_email': data.get('contact_email', ''),
            'contact_phone': data.get('contact_phone', '')
        }

        # Add found_date only if it's required by the database schema
        try:
            # First try without found_date
            result = supabase.table('items').insert(item_data).execute()
            return_early = True
        except Exception as e:
            # If it fails, add found_date and try again
            if 'violates not-null constraint' in str(e) and 'found_date' in str(e):
                item_data['found_date'] = datetime.utcnow().isoformat()
                return_early = False
            else:
                # Re-raise if it's a different error
                raise

        if return_early:
            # If the first attempt succeeded, we can return early
            created_item = result.data[0] if result.data else None
            current_app.logger.info(f"Lost item created successfully: {created_item}")

            # Create notification and return response
            if created_item:
                notification_data = {
                    'user_id': user_id,
                    'related_id': created_item.get('id'),  # Use related_id instead of item_id
                    'title': 'New Item Lost',
                    'message': f"New lost item '{data['name']}' has been reported.",
                    'type': 'item_lost',
                    'created_at': datetime.utcnow().isoformat(),
                    'read': False
                }

                current_app.logger.info(f"Creating notification: {notification_data}")
                notification_result = supabase.table('notifications').insert(notification_data).execute()

                if hasattr(notification_result, 'error') and notification_result.error:
                    current_app.logger.error(f"Notification creation error: {notification_result.error}")

            return jsonify({
                'message': 'Lost item reported successfully',
                'item': created_item
            }), 201

        current_app.logger.info(f"Inserting lost item data into Supabase (with found_date): {item_data}")

        # Insert into Supabase (second attempt with found_date)
        result = supabase.table('items').insert(item_data).execute()

        # Check for errors
        if hasattr(result, 'error') and result.error:
            current_app.logger.error(f"Supabase error: {result.error}")
            return jsonify({'error': f"Database error: {result.error}"}), 500

        # Get the created item
        created_item = result.data[0] if result.data else None
        current_app.logger.info(f"Lost item created successfully: {created_item}")

        # Create a notification in Supabase
        if created_item:
            notification_data = {
                'user_id': user_id,
                'related_id': created_item.get('id'),  # Use related_id instead of item_id
                'title': 'New Item Lost',
                'message': f"New lost item '{data['name']}' has been reported.",
                'type': 'item_lost',
                'created_at': datetime.utcnow().isoformat(),
                'read': False
            }

            current_app.logger.info(f"Creating notification: {notification_data}")
            notification_result = supabase.table('notifications').insert(notification_data).execute()

            if hasattr(notification_result, 'error') and notification_result.error:
                current_app.logger.error(f"Notification creation error: {notification_result.error}")

        return jsonify({
            'message': 'Lost item reported successfully',
            'item': created_item
        }), 201

    except Exception as e:
        current_app.logger.error(f"Error creating lost item: {str(e)}")
        return jsonify({'error': f"Failed to report lost item: {str(e)}"}), 500

@items_bp.route('/test-cors', methods=['GET', 'OPTIONS'])
def test_cors():
    response = jsonify({'message': 'CORS test successful'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return response