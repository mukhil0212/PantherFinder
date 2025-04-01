import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_sms(recipient_phone, message):
    """
    Send an SMS using Twilio
    
    Args:
        recipient_phone (str): The recipient's phone number (E.164 format)
        message (str): The SMS message content
    
    Returns:
        bool: True if SMS was sent successfully, False otherwise
    """
    try:
        # Get Twilio configuration from environment variables
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        twilio_phone = os.environ.get('TWILIO_PHONE_NUMBER')
        
        # Check if credentials are available
        if not all([account_sid, auth_token, twilio_phone]):
            print("Twilio credentials not configured. SMS not sent.")
            return False
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Format phone number if needed
        if not recipient_phone.startswith('+'):
            recipient_phone = '+' + recipient_phone
        
        # Send SMS
        message = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=recipient_phone
        )
        
        return True
    
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        return False

def send_notification_sms(user_phone, notification_message):
    """
    Send a notification SMS about a lost and found item
    
    Args:
        user_phone (str): The user's phone number
        notification_message (str): The notification message
    
    Returns:
        bool: True if SMS was sent successfully, False otherwise
    """
    # Format the message
    sms_message = f"Lost & Found Notification: {notification_message}\n\nPlease log in to your account for more details."
    
    return send_sms(user_phone, sms_message)