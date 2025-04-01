from app import create_app, supabase
from app.utils.supabase import query_builder
from werkzeug.security import generate_password_hash
from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker()

def seed_database():
    """Seed the database with sample data"""
    print("Seeding database...")
    
    # Create admin user
    admin_data = {
        'name': "Admin User",
        'email': "admin@lostandfound.com",
        'phone_number': "+1234567890",
        'role': "admin",
        'password_hash': generate_password_hash("admin123"),
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    # Insert admin user
    admin_response = query_builder('users').insert(admin_data).execute()
    admin = admin_response.data[0] if admin_response.data else None
    
    # Create regular users
    users = [admin] if admin else []
    for i in range(10):
        user_data = {
            'name': fake.name(),
            'email': fake.email(),
            'phone_number': fake.phone_number(),
            'role': "user",
            'password_hash': generate_password_hash("password123"),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        user_response = query_builder('users').insert(user_data).execute()
        user = user_response.data[0] if user_response.data else None
        if user:
            users.append(user)
    
    # Create drop-off locations
    locations = []
    for i in range(5):
        location_data = {
            'name': fake.company() + " Lost & Found",
            'address': fake.address(),
            'contact_person': fake.name(),
            'phone_number': fake.phone_number(),
            'latitude': float(fake.latitude()),
            'longitude': float(fake.longitude()),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        location_response = query_builder('drop_off_locations').insert(location_data).execute()
        location = location_response.data[0] if location_response.data else None
        if location:
            locations.append(location)
    
    # Create items
    categories = ["Electronics", "Clothing", "Accessories", "Documents", "Other"]
    statuses = ["found", "claimed", "returned"]
    
    for i in range(30):
        # Random dates within the last 30 days
        found_date = datetime.now() - timedelta(days=random.randint(0, 30))
        
        # Randomly select status
        status = random.choice(statuses)
        
        # If status is claimed or returned, set a claimer
        user_claimed_id = None
        if status in ["claimed", "returned"] and users:
            user_claimed_id = random.choice(users)['id']
        
        if users and locations:
            item_data = {
                'name': fake.word().capitalize() + " " + random.choice(["Wallet", "Phone", "Keys", "Bag", "Umbrella", "Glasses", "Watch"]),
                'category': random.choice(categories),
                'description': fake.text(max_nb_chars=200),
                'image_path': None,  # No images in seed data
                'found_date': found_date.isoformat(),
                'status': status,
                'drop_off_location_id': random.choice(locations)['id'],
                'user_found_id': random.choice(users)['id'],
                'user_claimed_id': user_claimed_id,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            query_builder('items').insert(item_data).execute()
    
    print("Database seeded successfully!")

def create_tables():
    """Create tables in Supabase if they don't exist"""
    # This function would typically use SQL to create tables
    # For Supabase, this is usually done through the web interface or migrations
    # This is a placeholder for demonstration purposes
    print("Tables should be created through Supabase interface or migrations")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        # Create tables if needed
        create_tables()
        # Seed the database
        seed_database()