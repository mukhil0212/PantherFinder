from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.supabase import get_supabase_client, query_builder

supabase = get_supabase_client()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(20))
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    found_items = db.relationship('Item', foreign_keys='Item.user_found_id', backref='finder', lazy='dynamic')
    claimed_items = db.relationship('Item', foreign_keys='Item.user_claimed_id', backref='claimer', lazy='dynamic')
    claims = db.relationship('Claim', backref='user', lazy='dynamic')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone_number': self.phone_number,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    # Supabase specific methods
    @classmethod
    def get_all(cls):
        response = query_builder('users').select('*').execute()
        return response.data
    
    @classmethod
    def get_by_id(cls, user_id):
        response = query_builder('users').select('*').eq('id', user_id).execute()
        return response.data[0] if response.data else None
    
    @classmethod
    def get_by_email(cls, email):
        response = query_builder('users').select('*').eq('email', email).execute()
        return response.data[0] if response.data else None
    
    @classmethod
    def create(cls, user_data):
        # Hash password before storing
        if 'password' in user_data:
            password = user_data.pop('password')
            user_data['password_hash'] = generate_password_hash(password)
        
        response = query_builder('users').insert(user_data).execute()
        return response.data[0] if response.data else None
    
    @classmethod
    def update(cls, user_id, user_data):
        # Don't allow updating password through this method
        if 'password' in user_data:
            del user_data['password']
        
        response = query_builder('users').update(user_data).eq('id', user_id).execute()
        return response.data[0] if response.data else None
    
    @classmethod
    def delete(cls, user_id):
        response = query_builder('users').delete().eq('id', user_id).execute()
        return response.data[0] if response.data else None
    
    def __repr__(self):
        return f'<User {self.name}>'