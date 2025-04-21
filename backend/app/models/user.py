from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.supabase import get_supabase_client

supabase = get_supabase_client()

class User:
    """User model for Supabase integration"""
    
    def __init__(self, id=None, name=None, email=None, phone_number=None, password_hash=None, role='user', created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.phone_number = phone_number
        self.password_hash = password_hash
        self.role = role
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.updated_at = updated_at or datetime.utcnow().isoformat()
    
    @classmethod
    def get_by_id(cls, user_id):
        """Get a user by ID from Supabase"""
        result = supabase.table('users').select('*').eq('id', user_id).execute()
        if result.data and len(result.data) > 0:
            user_data = result.data[0]
            return cls(**user_data)
        return None
    
    @classmethod
    def get_by_email(cls, email):
        """Get a user by email from Supabase"""
        result = supabase.table('users').select('*').eq('email', email).execute()
        if result.data and len(result.data) > 0:
            user_data = result.data[0]
            return cls(**user_data)
        return None
    
    def set_password(self, password):
        """Set the password hash for the user"""
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def save(self):
        """Save the user to Supabase"""
        user_data = self.to_dict()
        
        if self.id:
            # Update existing user
            result = supabase.table('users').update(user_data).eq('id', self.id).execute()
        else:
            # Create new user
            result = supabase.table('users').insert(user_data).execute()
            if result.data and len(result.data) > 0:
                self.id = result.data[0].get('id')
                
        return self
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone_number': self.phone_number,
            'password_hash': self.password_hash,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def get_found_items(self):
        """Get items found by this user"""
        result = supabase.table('items').select('*').eq('user_found_id', self.id).execute()
        return result.data if result.data else []
    
    def get_claimed_items(self):
        """Get items claimed by this user"""
        result = supabase.table('items').select('*').eq('user_claimed_id', self.id).execute()
        return result.data if result.data else []
    
    def get_notifications(self):
        """Get notifications for this user"""
        result = supabase.table('notifications').select('*').eq('user_id', self.id).order('created_at', desc=True).execute()
        return result.data if result.data else []
    
    @classmethod
    def create(cls, user_data):
        # Hash password before storing
        if 'password' in user_data:
            password = user_data.pop('password')
            user_data['password_hash'] = generate_password_hash(password)
        
        response = supabase.table('users').insert(user_data).execute()
        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None
    
    @classmethod
    def update(cls, user_id, user_data):
        # Don't allow updating password through this method
        if 'password' in user_data:
            del user_data['password']
            
        response = supabase.table('users').update(user_data).eq('id', user_id).execute()
        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None
    
    @classmethod
    def delete(cls, user_id):
        response = supabase.table('users').delete().eq('id', user_id).execute()
        return response.data[0] if response.data else None
    
    def __repr__(self):
        return f'<User {self.name}>'