import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Mock Supabase client for local development
class MockSupabaseClient:
    def __init__(self):
        self.tables = {}

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

# Initialize mock Supabase client
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