from flask import request, make_response, current_app
from functools import wraps

def cors_middleware(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the response
        response = make_response(f(*args, **kwargs))
        
        # Add CORS headers
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        
        return response
    
    return decorated_function

def handle_options_request():
    response = current_app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response
