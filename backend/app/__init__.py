from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import datetime
import os

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Import Supabase client
from app.utils.supabase import get_supabase_client
supabase = get_supabase_client()

def create_app(config=None):
    app = Flask(__name__)

    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')
    
    # Configure database - using SQLite for local development
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 'sqlite:///pantherfinder.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-key')

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Configure CORS properly using Flask-CORS
    cors_origins = ["http://localhost:3000", "https://pantherfinder.vercel.app"]
    CORS(app, 
         resources={r"/api/*": {"origins": cors_origins}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Handle OPTIONS requests
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            return response

    # Also use Flask-CORS for good measure
    CORS(app,
         resources={r"/api/*": {"origins": cors_origins}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    jwt.init_app(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.items import items_bp
    from app.routes.users import users_bp
    from app.routes.locations import locations_bp
    from app.routes.claims import claims_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(items_bp, url_prefix='/api/items')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(locations_bp, url_prefix='/api/locations')
    app.register_blueprint(claims_bp, url_prefix='/api/claims')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

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