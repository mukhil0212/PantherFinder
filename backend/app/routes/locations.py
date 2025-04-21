from flask import Blueprint, request, jsonify, current_app, g
from flask_jwt_extended import jwt_required, get_jwt
from app.models.drop_off_location import DropOffLocation
from app.utils.supabase import get_supabase_client
from app.utils.supabase_auth import supabase_auth_required, supabase_auth_optional
from geopy.distance import geodesic
from datetime import datetime

supabase = get_supabase_client()

locations_bp = Blueprint('locations', __name__)

# Helper function to check if user is admin
def is_admin():
    jwt_data = get_jwt()
    return jwt_data.get('role') == 'admin'

@locations_bp.route('', methods=['GET'])
@supabase_auth_optional
def get_locations():
    try:
        # Get paginated results
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Calculate start and end for pagination
        start = (page - 1) * per_page
        end = start + per_page - 1
        
        # Query locations from Supabase
        result = supabase.table('drop_off_locations').select('*').range(start, end).execute()
        
        # Get total count
        count_result = supabase.table('drop_off_locations').select('id', count='exact').execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(result.data)
        
        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1
        
        return jsonify({
            'locations': result.data,
            'total': total_count,
            'pages': total_pages,
            'current_page': page
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching locations: {str(e)}")
        return jsonify({'error': f"Failed to fetch locations: {str(e)}"}), 500

@locations_bp.route('/<location_id>', methods=['GET'])
@supabase_auth_optional
def get_location(location_id):
    try:
        # Get location from Supabase
        result = supabase.table('drop_off_locations').select('*').eq('id', location_id).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Location not found'}), 404
            
        location = result.data[0]
        return jsonify(location), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching location {location_id}: {str(e)}")
        return jsonify({'error': f"Failed to fetch location: {str(e)}"}), 500

@locations_bp.route('', methods=['POST'])
@supabase_auth_required
def create_location():
    try:
        # Check if user is admin
        user = g.user
        if user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ('name', 'address')):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Create location data
        location_data = {
            'name': data['name'],
            'address': data['address'],
            'contact_person': data.get('contact_person', ''),
            'phone_number': data.get('phone_number', ''),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Insert into Supabase
        result = supabase.table('drop_off_locations').insert(location_data).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Failed to create location'}), 500
    
        return jsonify({
            'message': 'Location created successfully',
            'location': result.data[0]
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating location: {str(e)}")
        return jsonify({'error': f"Failed to create location: {str(e)}"}), 500

@locations_bp.route('/<location_id>', methods=['PUT'])
@supabase_auth_required
def update_location(location_id):
    try:
        # Check if user is admin
        user = g.user
        if user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Check if location exists
        check_result = supabase.table('drop_off_locations').select('*').eq('id', location_id).execute()
        
        if not check_result.data or len(check_result.data) == 0:
            return jsonify({'error': 'Location not found'}), 404
            
        data = request.get_json()
        
        # Prepare update data
        update_data = {}
        for field in ['name', 'address', 'contact_person', 'phone_number', 'latitude', 'longitude']:
            if field in data:
                update_data[field] = data[field]
                
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
            
        # Update in Supabase
        result = supabase.table('drop_off_locations').update(update_data).eq('id', location_id).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({'error': 'Failed to update location'}), 500
    
        return jsonify({
            'message': 'Location updated successfully',
            'location': result.data[0]
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error updating location {location_id}: {str(e)}")
        return jsonify({'error': f"Failed to update location: {str(e)}"}), 500

@locations_bp.route('/<location_id>', methods=['DELETE'])
@supabase_auth_required
def delete_location(location_id):
    try:
        # Check if user is admin
        user = g.user
        if user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Check if location exists
        check_result = supabase.table('drop_off_locations').select('*').eq('id', location_id).execute()
        
        if not check_result.data or len(check_result.data) == 0:
            return jsonify({'error': 'Location not found'}), 404
            
        # Check if location has items
        items_result = supabase.table('items').select('id').eq('drop_off_location_id', location_id).execute()
        
        if items_result.data and len(items_result.data) > 0:
            return jsonify({'error': 'Cannot delete location with associated items'}), 400
            
        # Delete from Supabase
        result = supabase.table('drop_off_locations').delete().eq('id', location_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to delete location'}), 500
            
        return jsonify({'message': 'Location deleted successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting location {location_id}: {str(e)}")
        return jsonify({'error': f"Failed to delete location: {str(e)}"}), 500

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