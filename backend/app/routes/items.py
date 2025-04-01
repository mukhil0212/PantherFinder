from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.item import Item
from app.models.user import User
from app.models.notification import Notification
from app import db
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename

items_bp = Blueprint('items', __name__)

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

@items_bp.route('/', methods=['GET'])
def get_items():
    # Get query parameters for filtering
    category = request.args.get('category')
    status = request.args.get('status')
    search = request.args.get('search')
    
    # Start with base query
    query = Item.query
    
    # Apply filters if provided
    if category:
        query = query.filter(Item.category == category)
    if status:
        query = query.filter(Item.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Item.name.ilike(search_term)) | 
            (Item.description.ilike(search_term))
        )
    
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    paginated_items = query.order_by(Item.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'items': [item.to_dict() for item in paginated_items.items],
        'total': paginated_items.total,
        'pages': paginated_items.pages,
        'current_page': page
    }), 200

@items_bp.route('/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_dict()), 200

@items_bp.route('/', methods=['POST'])
@jwt_required()
def create_item():
    user_id = get_jwt_identity()
    
    # Handle multipart/form-data
    data = request.form.to_dict()
    image = request.files.get('image')
    
    # Validate required fields
    if 'name' not in data:
        return jsonify({'error': 'Item name is required'}), 400
    
    # Save image if provided
    image_path = save_image(image) if image else None
    
    # Create new item
    item = Item(
        name=data['name'],
        category=data.get('category'),
        description=data.get('description', ''),
        image_path=image_path,
        found_date=datetime.utcnow(),
        status='found',
        drop_off_location_id=data.get('drop_off_location_id', type=int),
        user_found_id=user_id
    )
    
    db.session.add(item)
    db.session.commit()
    
    # Create notifications for potential matches (simplified version)
    # In a real system, you would implement a more sophisticated matching algorithm
    # This is just a basic example
    if item.category:
        # Find users who might be interested in this item
        # For example, users who have reported lost items in the same category
        # This is a placeholder for a more complex matching system
        notification = Notification(
            user_id=user_id,  # Just notify the finder for now
            item_id=item.id,
            message=f"New item '{item.name}' has been added to the lost and found system.",
            notification_type='item_found'
        )
        db.session.add(notification)
        db.session.commit()
    
    return jsonify({
        'message': 'Item created successfully',
        'item': item.to_dict()
    }), 201

@items_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    user_id = get_jwt_identity()
    item = Item.query.get_or_404(item_id)
    
    # Check if user is authorized (admin or the finder)
    if not is_admin() and item.user_found_id != user_id:
        return jsonify({'error': 'Unauthorized to update this item'}), 403
    
    # Handle multipart/form-data
    data = request.form.to_dict()
    image = request.files.get('image')
    
    # Update fields if provided
    if 'name' in data:
        item.name = data['name']
    if 'category' in data:
        item.category = data['category']
    if 'description' in data:
        item.description = data['description']
    if 'status' in data:
        item.status = data['status']
    if 'drop_off_location_id' in data and data['drop_off_location_id']:
        item.drop_off_location_id = int(data['drop_off_location_id'])
    
    # Save new image if provided
    if image:
        item.image_path = save_image(image)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item updated successfully',
        'item': item.to_dict()
    }), 200

@items_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    user_id = get_jwt_identity()
    item = Item.query.get_or_404(item_id)
    
    # Check if user is authorized (admin or the finder)
    if not is_admin() and item.user_found_id != user_id:
        return jsonify({'error': 'Unauthorized to delete this item'}), 403
    
    # Delete associated notifications and claims
    Notification.query.filter_by(item_id=item.id).delete()
    
    # Delete the item
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200

@items_bp.route('/categories', methods=['GET'])
def get_categories():
    # Get distinct categories from the database
    categories = db.session.query(Item.category).distinct().filter(Item.category.isnot(None)).all()
    category_list = [category[0] for category in categories]
    
    return jsonify({'categories': category_list}), 200