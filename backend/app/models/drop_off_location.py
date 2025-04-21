from datetime import datetime
from app.utils.supabase import get_supabase_client

supabase = get_supabase_client()

class DropOffLocation:
    """DropOffLocation model for Supabase integration"""
    
    def __init__(self, id=None, name=None, address=None, contact_person=None, phone_number=None,
                 latitude=None, longitude=None, created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.address = address
        self.contact_person = contact_person
        self.phone_number = phone_number
        self.latitude = latitude
        self.longitude = longitude
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()
    
    @classmethod
    def get_by_id(cls, location_id):
        """Get a location by ID from Supabase"""
        result = supabase.table('drop_off_locations').select('*').eq('id', location_id).execute()
        if result.data and len(result.data) > 0:
            location_data = result.data[0]
            return cls(**location_data)
        return None
    
    @classmethod
    def get_all(cls):
        """Get all locations from Supabase"""
        result = supabase.table('drop_off_locations').select('*').execute()
        locations = [cls(**location_data) for location_data in result.data] if result.data else []
        return locations
    
    def save(self):
        """Save the location to Supabase"""
        location_data = self.to_dict()
        
        if self.id:
            # Update existing location
            result = supabase.table('drop_off_locations').update(location_data).eq('id', self.id).execute()
        else:
            # Create new location
            result = supabase.table('drop_off_locations').insert(location_data).execute()
            if result.data and len(result.data) > 0:
                self.id = result.data[0].get('id')
                
        return self
    
    def delete(self):
        """Delete the location from Supabase"""
        if self.id:
            result = supabase.table('drop_off_locations').delete().eq('id', self.id).execute()
            return result.data if result.data else None
        return None
    
    def get_items(self):
        """Get items associated with this location"""
        result = supabase.table('items').select('*').eq('drop_off_location_id', self.id).execute()
        return result.data if result.data else []
    
    def to_dict(self):
        """Convert location object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'contact_person': self.contact_person,
            'phone_number': self.phone_number,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def __repr__(self):
        return f'<DropOffLocation {self.name}>'