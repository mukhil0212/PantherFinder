import os
import uuid
from PIL import Image
from werkzeug.utils import secure_filename
from flask import current_app

def save_image(file, folder='uploads', allowed_extensions=None, max_size=(800, 800)):
    """
    Save and process an uploaded image
    
    Args:
        file: The uploaded file object
        folder (str): The subfolder within static to save the image
        allowed_extensions (list): List of allowed file extensions
        max_size (tuple): Maximum dimensions for the image
    
    Returns:
        str: The relative path to the saved image, or None if failed
    """
    if not file:
        return None
    
    if allowed_extensions is None:
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
    
    # Check if the file extension is allowed
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    if ext not in allowed_extensions:
        return None
    
    # Generate a unique filename
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    
    # Create the upload directory if it doesn't exist
    upload_folder = os.path.join(current_app.static_folder, folder)
    os.makedirs(upload_folder, exist_ok=True)
    
    # Save the file path
    file_path = os.path.join(upload_folder, unique_filename)
    
    # Process and save the image
    try:
        # Save the original file temporarily
        file.save(file_path)
        
        # Open the image with PIL
        with Image.open(file_path) as img:
            # Convert to RGB if needed (for PNG with transparency)
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize if larger than max_size
            if img.width > max_size[0] or img.height > max_size[1]:
                img.thumbnail(max_size, Image.LANCZOS)
            
            # Save the processed image
            img.save(file_path, optimize=True, quality=85)
        
        # Return the relative path for database storage
        return f"/static/{folder}/{unique_filename}"
    
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        # Remove the file if there was an error
        if os.path.exists(file_path):
            os.remove(file_path)
        return None

def delete_image(image_path):
    """
    Delete an image file
    
    Args:
        image_path (str): The relative path to the image
    
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    if not image_path or not image_path.startswith('/static/'):
        return False
    
    try:
        # Get the absolute path
        abs_path = os.path.join(current_app.root_path, '..', image_path.lstrip('/'))
        
        # Check if file exists and delete it
        if os.path.exists(abs_path):
            os.remove(abs_path)
            return True
        return False
    
    except Exception as e:
        print(f"Error deleting image: {str(e)}")
        return False