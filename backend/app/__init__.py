from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
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

    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')

    # Import and register CORS middleware
    from app.middleware.cors_middleware import handle_options_request

    # Handle OPTIONS requests for CORS preflight
    app.before_request(lambda: handle_options_request() if request.method == 'OPTIONS' else None)

    # Configure database - using SQLite for local development
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 'sqlite:///pantherfinder.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-key')

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)

    # Configure CORS to allow requests from frontend
    CORS(app,
         origins=["http://localhost:3000", "https://pantherfinder.vercel.app"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
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

    # Add a root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return {'status': 'ok', 'message': 'PantherFinder API is running'}, 200

    return app