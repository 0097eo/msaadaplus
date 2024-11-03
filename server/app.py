from config import app, db, api, bcrypt
from models import User, UserType, DonorProfile, CharityProfile, CharityStatus
from email.mime.text import MIMEText
import smtplib
from flask_restful import Resource
from flask import request, jsonify
import secrets
from datetime import datetime
import re

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_password(password):
    # At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True

def send_email(recipient, subject, body):
    sender = 'emmanuelokello294@gmail.com'
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login('emmanuelokello294@gmail.com', 'quzo ygrw gcse maim')
            smtp.send_message(msg)
    except Exception as e:
        print(f"Error sending email: {e}")
        raise e


def send_verification_email(email, verification_code):
    subject = 'MsaadaPlus - Verify your email address'
    body = f'''
    Welcome to MsaadaPlus!
    
    Your verification code is: {verification_code}
    
    Please enter this code in the verification page to activate your account.
    This code will expire in 24 hours.
    
    Best regards,
    MsaadaPlus Team
    '''
    send_email(email, subject, body)

class Register(Resource):
    def post(self):
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['username', 'email', 'password', 'user_type']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            # Validate email format
            if not validate_email(data['email']):
                return {'error': 'Invalid email format'}, 400
            
            # Validate password strength
            if not validate_password(data['password']):
                return {'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'}, 400
            
            # Check if user already exists
            if User.query.filter_by(username=data['username']).first():
                return {'error': 'Username already exists'}, 400
            if User.query.filter_by(email=data['email']).first():
                return {'error': 'Email already exists'}, 400
            
            # Validate user type
            try:
                user_type = UserType(data['user_type'])
            except ValueError:
                return {'error': 'Invalid user type'}, 400

            verification_code = secrets.token_hex(3)
            new_user = User(
                username=data['username'],
                email=data['email'],
                user_type=user_type,
                verification_code=verification_code
            )
            new_user.password = data['password']
            
            db.session.add(new_user)
            
            # Create corresponding profile based on user type
            if user_type == UserType.DONOR:
                if not all(key in data for key in ['full_name', 'phone']):
                    return {'error': 'Full name and phone are required for donor registration'}, 400
                
                profile = DonorProfile(
                    user=new_user,
                    full_name=data['full_name'],
                    phone=data['phone'],
                    is_anonymous=data.get('is_anonymous', False),
                    notification_preference=data.get('notification_preference', True)
                )
                db.session.add(profile)
                
            elif user_type == UserType.CHARITY:
                required_charity_fields = ['name', 'description', 'registration_number', 'contact_email', 'contact_phone']
                if not all(key in data for key in required_charity_fields):
                    return {'error': f'Missing required charity fields: {", ".join(required_charity_fields)}'}, 400
                
                profile = CharityProfile(
                    user=new_user,
                    name=data['name'],
                    description=data['description'],
                    reqistration_number=data['registration_number'],
                    status=CharityStatus.PENDING,
                    contact_email=data['contact_email'],
                    contact_phone=data['contact_phone'],
                    bank_account=data.get('bank_account', '')
                )
                db.session.add(profile)
            
            db.session.commit()
            
            # Send verification email
            try:
                send_verification_email(new_user.email, verification_code)
            except Exception as e:
                db.session.rollback()
                return {'error': 'Failed to send verification email'}, 500
            
            return {
                'message': 'Registration successful, check your email for a verification code',
                'user_id': new_user.id,
                'user_type': user_type.value
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

class VerifyEmail(Resource):
    def post(self):
        try:
            data = request.get_json()
            
            if 'email' not in data or 'verification_code' not in data:
                return {'error': 'Email and verification code are required'}, 400
            
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            if user.verification_code != data['verification_code']:
                return {'error': 'Invalid verification code'}, 400
            
            user.verification_code = None
            db.session.commit()
            
            return {'message': 'Email verified successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

class ResendVerification(Resource):
    def post(self):
        try:
            data = request.get_json()
            
            if 'email' not in data:
                return {'error': 'Email is required'}, 400
            
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            if not user.verification_code:
                return {'error': 'Email already verified'}, 400
            
            verification_code = secrets.token_hex(3)
            user.verification_code = verification_code
            db.session.commit()
            
            try:
                send_verification_email(user.email, verification_code)
                return {'message': 'Verification email resent'}, 200
            except Exception as e:
                db.session.rollback()
                return {'error': 'Failed to send verification email'}, 500
                
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500


api.add_resource(Register, '/register')
api.add_resource(VerifyEmail, '/verify-email')
api.add_resource(ResendVerification, '/resend-verification')

if __name__ == '__main__':
    app.run(port=5555, debug=True)