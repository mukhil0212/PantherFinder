from app import db
from datetime import datetime

class Claim(db.Model):
    __tablename__ = 'claims'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    claim_date = db.Column(db.DateTime, default=datetime.utcnow)
    verification_status = db.Column(db.String(20), default='pending')  # 'pending', 'verified', 'rejected'
    proof_description = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'user_id': self.user_id,
            'claim_date': self.claim_date.isoformat() if self.claim_date else None,
            'verification_status': self.verification_status,
            'proof_description': self.proof_description,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Claim {self.id} for Item {self.item_id}>'