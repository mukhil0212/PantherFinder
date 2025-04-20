import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment variables
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_KEY')

# Initialize Supabase client
supabase: Client = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("Supabase client initialized successfully")
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        # Fall back to mock client if there's an error
        supabase = None
else:
    print("Supabase credentials not found in environment variables")
    supabase = None

# Mock Supabase client for local development or if real client fails
class MockSupabaseClient:
    def __init__(self):
        self.tables = {}
        print("Using Mock Supabase Client")

    def table(self, table_name):
        if table_name not in self.tables:
            self.tables[table_name] = MockTable(table_name)
        return self.tables[table_name]

class MockTable:
    def __init__(self, name):
        self.name = name
        self.data = []
        self.conditions = []

    def select(self, columns):
        return self

    def insert(self, data):
        return self

    def update(self, data):
        return self

    def delete(self):
        return self

    def eq(self, column, value):
        return self

    def execute(self):
        return {'data': []}

# Use mock client if real client initialization failed
if supabase is None:
    supabase = MockSupabaseClient()

def get_supabase_client():
    """Returns the Supabase client instance"""
    return supabase

# Helper functions for common operations
def fetch_all(table_name):
    """Fetch all records from a table"""
    return supabase.table(table_name).select('*').execute()

def fetch_by_id(table_name, id):
    """Fetch a record by ID"""
    return supabase.table(table_name).select('*').eq('id', id).execute()

def insert_record(table_name, data):
    """Insert a new record"""
    return supabase.table(table_name).insert(data).execute()

def update_record(table_name, id, data):
    """Update a record by ID"""
    return supabase.table(table_name).update(data).eq('id', id).execute()

def delete_record(table_name, id):
    """Delete a record by ID"""
    return supabase.table(table_name).delete().eq('id', id).execute()

def query_builder(table_name):
    """Return a query builder for more complex queries"""
    return supabase.table(table_name)

# Auth helper functions
def sign_up(email, password, user_metadata=None):
    """Register a new user"""
    return supabase.auth.sign_up({
        'email': email,
        'password': password,
        'options': {
            'data': user_metadata
        }
    })

def sign_in(email, password):
    """Sign in a user"""
    return supabase.auth.sign_in_with_password({
        'email': email,
        'password': password
    })

def sign_out():
    """Sign out the current user"""
    return supabase.auth.sign_out()

def get_user(user_id):
    """Get user by ID"""
    return supabase.auth.admin.get_user_by_id(user_id)

def update_user(user_id, user_data):
    """Update user data"""
    return supabase.auth.admin.update_user_by_id(user_id, user_data)