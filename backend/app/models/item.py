from datetime import datetime
from app.utils.supabase import get_supabase_client

supabase = get_supabase_client()

class Item:
    """Item model for Supabase integration"""
    
    def __init__(self, id=None, name=None, category=None, description=None, image_path=None, 
                 lost_date=None, found_date=None, status='found', created_at=None, updated_at=None,
                 drop_off_location_id=None, user_found_id=None, user_claimed_id=None, location=None):
        self.id = id
        self.name = name
        self.category = category
        self.description = description
        self.image_path = image_path
        self.lost_date = lost_date
        self.found_date = found_date or datetime.utcnow().isoformat()
        self.status = status  # 'found', 'claimed', 'returned'
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()
        self.drop_off_location_id = drop_off_location_id
        self.user_found_id = user_found_id
        self.user_claimed_id = user_claimed_id
        self.location = location
    
    @classmethod
    def get_by_id(cls, item_id):
        """Get an item by ID from Supabase"""
        result = supabase.table('items').select('*').eq('id', item_id).execute()
        if result.data and len(result.data) > 0:
            item_data = result.data[0]
            return cls(**item_data)
        return None
    
    @classmethod
    def get_all(cls, filters=None, page=1, per_page=10):
        """Get all items with optional filtering and pagination"""
        query = supabase.table('items').select('*')
        
        # Apply filters if provided
        if filters:
            if 'category' in filters and filters['category']:
                query = query.eq('category', filters['category'])
            if 'status' in filters and filters['status']:
                query = query.eq('status', filters['status'])
            if 'user_found_id' in filters and filters['user_found_id']:
                query = query.eq('user_found_id', filters['user_found_id'])
        
        # Apply pagination
        start = (page - 1) * per_page
        end = start + per_page - 1
        query = query.range(start, end)
        
        # Execute query
        result = query.execute()
        
        # Convert to Item objects
        items = [cls(**item_data) for item_data in result.data] if result.data else []
        return items
    
    def save(self):
        """Save the item to Supabase"""
        item_data = self.to_dict()
        
        if self.id:
            # Update existing item
            result = supabase.table('items').update(item_data).eq('id', self.id).execute()
        else:
            # Create new item
            result = supabase.table('items').insert(item_data).execute()
            if result.data and len(result.data) > 0:
                self.id = result.data[0].get('id')
                
        return self
    
    def delete(self):
        """Delete the item from Supabase"""
        if self.id:
            result = supabase.table('items').delete().eq('id', self.id).execute()
            return result.data if result.data else None
        return None
    
    def to_dict(self):
        """Convert item object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'image_path': self.image_path,
            'lost_date': self.lost_date,
            'found_date': self.found_date,
            'status': self.status,
            'drop_off_location_id': self.drop_off_location_id,
            'user_found_id': self.user_found_id,
            'user_claimed_id': self.user_claimed_id,
            'location': self.location,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def __repr__(self):
        return f'<Item {self.name}>'