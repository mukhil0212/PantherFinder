from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import datetime
import os

# Load environment variables
load_dotenv()

# Initialize extensions
jwt = JWTManager()

# Import Supabase client
from app.utils.supabase import get_supabase_client
supabase = get_supabase_client()

def create_app(config=None):
    app = Flask(__name__)

    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')

    # Configure JWT
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-for-testing')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

    # Initialize JWT extension with app
    jwt.init_app(app)

    # Configure CORS properly - SINGLE configuration to avoid conflicts
    cors_origins = ["http://localhost:3000", "https://pantherfinder.vercel.app"]
    CORS(app,
         resources={r"/*": {"origins": cors_origins}},  # Apply to all routes
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Authorization"])

    # Handle OPTIONS requests for CORS preflight
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            # Add CORS headers to response
            response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.items import items_bp
    from app.routes.users import users_bp
    from app.routes.locations import locations_bp
    from app.routes.claims import claims_bp
    from app.routes.notifications import notifications_bp
    from app.routes.messages import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(items_bp, url_prefix='/api/items')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(locations_bp, url_prefix='/api/locations')
    app.register_blueprint(claims_bp, url_prefix='/api/claims')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')

    # Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'error': 'Server error'}), 500

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token expired',
            'message': 'The token has expired. Please log in again.'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': 'Signature verification failed.'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization required',
            'message': 'Request does not contain an access token.'
        }), 401

    # Add a health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'ok', 'message': 'API is running'}, 200

    # Add a CORS test endpoint
    @app.route('/api/cors-test', methods=['GET', 'OPTIONS'])
    def cors_test():
        # Print request details for debugging
        print(f"CORS Test Request: {request.method} {request.path}")
        print(f"CORS Test Headers: {dict(request.headers)}")

        # Return a simple response
        return {'status': 'ok', 'message': 'CORS is working', 'timestamp': str(datetime.now())}, 200

    # Add a root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return {'status': 'ok', 'message': 'PantherFinder API is running'}, 200

    return app