from app import db
from datetime import datetime

class Item(db.Model):
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    description = db.Column(db.Text)
    image_path = db.Column(db.String(255))
    lost_date = db.Column(db.DateTime)
    found_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='found')  # 'found', 'claimed', 'returned'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    drop_off_location_id = db.Column(db.Integer, db.ForeignKey('drop_off_locations.id'))
    user_found_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_claimed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    claims = db.relationship('Claim', backref='item', lazy='dynamic')
    notifications = db.relationship('Notification', backref='item', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'image_path': self.image_path,
            'lost_date': self.lost_date.isoformat() if self.lost_date else None,
            'found_date': self.found_date.isoformat() if self.found_date else None,
            'status': self.status,
            'drop_off_location_id': self.drop_off_location_id,
            'user_found_id': self.user_found_id,
            'user_claimed_id': self.user_claimed_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Item {self.name}>'