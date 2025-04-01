import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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