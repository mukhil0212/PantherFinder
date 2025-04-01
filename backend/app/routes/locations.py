from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models.drop_off_location import DropOffLocation
from app import db
from geopy.distance import geodesic

locations_bp = Blueprint('locations', __name__)

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@locations_bp.route('/', methods=['GET'])
def get_locations():
    # Get paginated results
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    locations = DropOffLocation.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'locations': [location.to_dict() for location in locations.items],
        'total': locations.total,
        'pages': locations.pages,
        'current_page': page
    }), 200

@locations_bp.route('/<int:location_id>', methods=['GET'])
def get_location(location_id):
    location = DropOffLocation.query.get_or_404(location_id)
    return jsonify(location.to_dict()), 200

@locations_bp.route('/', methods=['POST'])
@jwt_required()
def create_location():
    # Only admins can create locations
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('name', 'address')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create new location
    location = DropOffLocation(
        name=data['name'],
        address=data['address'],
        contact_person=data.get('contact_person'),
        phone_number=data.get('phone_number'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude')
    )
    
    db.session.add(location)
    db.session.commit()
    
    return jsonify({
        'message': 'Location created successfully',
        'location': location.to_dict()
    }), 201

@locations_bp.route('/<int:location_id>', methods=['PUT'])
@jwt_required()
def update_location(location_id):
    # Only admins can update locations
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    location = DropOffLocation.query.get_or_404(location_id)
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        location.name = data['name']
    if 'address' in data:
        location.address = data['address']
    if 'contact_person' in data:
        location.contact_person = data['contact_person']
    if 'phone_number' in data:
        location.phone_number = data['phone_number']
    if 'latitude' in data:
        location.latitude = data['latitude']
    if 'longitude' in data:
        location.longitude = data['longitude']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Location updated successfully',
        'location': location.to_dict()
    }), 200

@locations_bp.route('/<int:location_id>', methods=['DELETE'])
@jwt_required()
def delete_location(location_id):
    # Only admins can delete locations
    if not is_admin():
        return jsonify({'error': 'Unauthorized access'}), 403
    
    location = DropOffLocation.query.get_or_404(location_id)
    
    # Check if location has associated items
    if location.items.count() > 0:
        return jsonify({'error': 'Cannot delete location with associated items'}), 400
    
    db.session.delete(location)
    db.session.commit()
    
    return jsonify({'message': 'Location deleted successfully'}), 200

@locations_bp.route('/nearest', methods=['GET'])
def get_nearest_location():
    # Get user's coordinates from query parameters
    try:
        user_lat = float(request.args.get('latitude'))
        user_lng = float(request.args.get('longitude'))
    except (TypeError, ValueError):
        return jsonify({'error': 'Valid latitude and longitude are required'}), 400
    
    # Get all locations with coordinates
    locations = DropOffLocation.query.filter(
        DropOffLocation.latitude.isnot(None),
        DropOffLocation.longitude.isnot(None)
    ).all()
    
    if not locations:
        return jsonify({'error': 'No locations with coordinates available'}), 404
    
    # Calculate distances and find the nearest location
    user_coords = (user_lat, user_lng)
    nearest_location = None
    min_distance = float('inf')
    
    for location in locations:
        location_coords = (location.latitude, location.longitude)
        distance = geodesic(user_coords, location_coords).kilometers
        
        if distance < min_distance:
            min_distance = distance
            nearest_location = location
    
    return jsonify({
        'location': nearest_location.to_dict(),
        'distance_km': min_distance
    }), 200