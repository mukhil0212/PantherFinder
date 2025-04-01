import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_email(recipient_email, subject, message_body):
    """
    Send an email using SMTP
    
    Args:
        recipient_email (str): The recipient's email address
        subject (str): The email subject
        message_body (str): The email body (HTML format supported)
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Get email configuration from environment variables
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        sender_email = os.environ.get('SENDER_EMAIL', smtp_username)
        
        # Check if credentials are available
        if not all([smtp_username, smtp_password]):
            print("SMTP credentials not configured. Email not sent.")
            return False
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        # Attach HTML content
        html_part = MIMEText(message_body, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        return True
    
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def send_notification_email(user_email, notification_message, item_name=None):
    """
    Send a notification email about a lost and found item
    
    Args:
        user_email (str): The user's email address
        notification_message (str): The notification message
        item_name (str, optional): The name of the item
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    subject = f"Lost & Found Notification: {item_name}" if item_name else "Lost & Found Notification"
    
    # Create HTML email body
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #4CAF50; color: white; padding: 10px; text-align: center; }}
            .content {{ padding: 20px; border: 1px solid #ddd; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Lost & Found Notification</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>{notification_message}</p>
                <p>Please log in to your account to view more details.</p>
                <p>Thank you for using our Lost & Found system!</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user_email, subject, html_body)