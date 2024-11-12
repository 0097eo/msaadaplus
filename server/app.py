from config import app, db, api, bcrypt
from models import User, UserType, DonorProfile, CharityProfile, CharityStatus, Donation, DonationType, RecurringDonation, InventoryItem, Story, Beneficiary
from email.mime.text import MIMEText
import smtplib
from flask_restful import Resource
from flask import request
import secrets
from datetime import timedelta, datetime
import re
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from sqlalchemy.orm import Session
import cloudinary
from cloudinary.uploader import upload
from cloudinary.utils import cloudinary_url
from functools import wraps
import os
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import base64
import calendar

load_dotenv()
# Daraja API credentials
DARAJA_CONSUMER_KEY = os.getenv('DARAJA_CONSUMER_KEY')
DARAJA_CONSUMER_SECRET = os.getenv('DARAJA_CONSUMER_SECRET')
DARAJA_SHORTCODE = os.getenv('DARAJA_SHORTCODE')
DARAJA_PASSKEY = os.getenv('DARAJA_PASSKEY')
DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke"

#daraja accesstoken
def generate_daraja_token():
    auth_url = f"{DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(auth_url, auth=HTTPBasicAuth(DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET))
    response_json = response.json()
    return response_json['access_token']



def configure_cloudinary():
    """Configure Cloudinary with environment variables"""
    try:
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET')
        )
    except Exception as e:
        print(f"Error configuring Cloudinary: {str(e)}")
        raise

def require_cloudinary(f):
    """Decorator to ensure Cloudinary is configured before upload"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not all([
            cloudinary.config().cloud_name,
            cloudinary.config().api_key,
            cloudinary.config().api_secret
        ]):
            configure_cloudinary()
        return f(*args, **kwargs)
    return decorated_function

@require_cloudinary
def upload_image_to_cloudinary(image_file):
    """
    Upload image to Cloudinary with error handling and retry logic
    
    Args:
        image_file: File object from request.files
    Returns:
        str: Cloudinary secure URL of the uploaded image
    Raises:
        Exception: If upload fails after retries
    """
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            result = cloudinary.uploader.upload(
                image_file,
                folder="charity_stories",
                transformation={
                    'width': 800,
                    'height': 600,
                    'crop': 'fill',
                    'quality': 'auto:good'
                }
            )
            return result['secure_url']
        except Exception as e:
            retry_count += 1
            if retry_count == max_retries:
                print(f"Failed to upload image after {max_retries} attempts: {str(e)}")
                raise Exception("Failed to upload image to Cloudinary")
            print(f"Upload attempt {retry_count} failed, retrying...")

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
            smtp.login('emmanuelokello294@gmail.com', 'ccgr zxvn tqza nwkb')
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
        
class Login(Resource):
    def post(self):
        try:
            data = request.get_json()

            if not all(key in data for key in ['email', 'password']):
                return {'error': 'Email and password are required'}, 400
            
            user = User.query.filter_by(email=data['email']).first()
            if not user or not user.verify_password(data['password']):
                return {'error': 'Invalid email or password'}, 401
            
            if user.verification_code:
                return {'error': 'Email not yet verified'}, 401
            
            access_token = create_access_token(
                identity=user.id,
                additional_claims={'user_type': user.user_type.value},
                expires_delta=timedelta(days=1)
            )
            
            return {
                'access_token': access_token,
                'user_id': user.id,
                'user_type': user.user_type.value
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
        

class UpdateProfile(Resource):
    @jwt_required()
    def put(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            data = request.get_json()
            
            if user.user_type == UserType.DONOR:
                profile = user.donor_profile
                if not profile:
                    return {'error': 'Donor profile not found'}, 404
                
                # Update donor profile fields
                if 'full_name' in data:
                    profile.full_name = data['full_name']
                if 'phone' in data:
                    profile.phone = data['phone']
                if 'is_anonymous' in data:
                    profile.is_anonymous = data['is_anonymous']
                if 'notification_preference' in data:
                    profile.notification_preference = data['notification_preference']
                
            elif user.user_type == UserType.CHARITY:
                profile = user.charity_profile
                if not profile:
                    return {'error': 'Charity profile not found'}, 404
                
                # Update charity profile fields
                if 'name' in data:
                    profile.name = data['name']
                if 'description' in data:
                    profile.description = data['description']
                if 'contact_email' in data:
                    profile.contact_email = data['contact_email']
                if 'contact_phone' in data:
                    profile.contact_phone = data['contact_phone']
                if 'bank_account' in data:
                    profile.bank_account = data['bank_account']
            
            db.session.commit()
            return {'message': 'Profile updated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
        
class ProfileDetails(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user:
                return {'error': 'User not found'}, 404

            if user.user_type == UserType.DONOR:
                profile = user.donor_profile
                if not profile:
                    return {'error': 'Donor profile not found'}, 404

                # Get all donations and recurring donations
                donations = [{
                    'id': d.id,
                    'amount': float(d.amount),
                    'donation_type': d.donation_type.value,
                    'payment_status': d.payment_status,
                    'charity_name': d.charity_profile.name,
                    'created_at': d.created_at.strftime('%Y-%m-%d')
                } for d in profile.donations]

                recurring_donations = [{
                    'id': rd.id,
                    'amount': float(rd.amount),
                    'frequency': rd.frequency.value,
                    'is_active': rd.is_active,
                    'next_donation_date': rd.next_donation_date.strftime('%Y-%m-%d'),
                    'charity_name': rd.charity_profile.name,
                    'created_at': rd.created_at.strftime('%Y-%m-%d')
                } for rd in profile.recurring_donations]

                return {
                    'profile_type': 'donor',
                    'profile': {
                        'id': profile.id,
                        'full_name': profile.full_name,
                        'phone': profile.phone,
                        'is_anonymous': profile.is_anonymous,
                        'notification_preference': profile.notification_preference,
                        'email': user.email,
                        'username': user.username,
                        'created_at': user.created_at.strftime('%Y-%m-%d')
                    },
                    'donations': donations,
                    'recurring_donations': recurring_donations
                }, 200

            elif user.user_type == UserType.CHARITY:
                profile = user.charity_profile
                if not profile:
                    return {'error': 'Charity profile not found'}, 404

                # Get beneficiaries, stories, and donations
                beneficiaries = [{
                    'id': b.id,
                    'name': b.name,
                    'age': b.age,
                    'school': b.school,
                    'location': b.location
                } for b in profile.beneficiaries]

                stories = [{
                    'id': s.id,
                    'title': s.title,
                    'content': s.content,
                    'image_url': s.image_url,
                    'created_at': s.created_at.strftime('%Y-%m-%d')
                } for s in profile.stories]

                donations = [{
                    'id': d.id,
                    'amount': float(d.amount),
                    'donation_type': d.donation_type.value,
                    'payment_status': d.payment_status,
                    'donor_name': d.donor_profile.full_name if not d.donor_profile.is_anonymous else 'Anonymous',
                    'created_at': d.created_at.strftime('%Y-%m-%d')
                } for d in profile.donations]

                return {
                    'profile_type': 'charity',
                    'profile': {
                        'id': profile.id,
                        'name': profile.name,
                        'description': profile.description,
                        'registration_number': profile.reqistration_number,
                        'status': profile.status.value,
                        'contact_email': profile.contact_email,
                        'contact_phone': profile.contact_phone,
                        'bank_account': profile.bank_account,
                        'email': user.email,
                        'username': user.username,
                        'created_at': user.created_at.strftime('%Y-%m-%d')
                    },
                    'beneficiaries': beneficiaries,
                    'stories': stories,
                    'donations': donations
                }, 200

            return {'error': 'Invalid user type'}, 400

        except Exception as e:
            return {'error': str(e)}, 500


class RequestPasswordReset(Resource):
    def post(self):
        try:
            data = request.get_json()
            
            if 'email' not in data:
                return {'error': 'Email is required'}, 400
            
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            reset_token = secrets.token_urlsafe(32)
            user.reset_token = reset_token
            user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
            db.session.commit()
            
            # Send reset email
            subject = 'MsaadaPlus - Password Reset Request'
            body = f'''
            You have requested to reset your password.
            
            Please use the following token to reset your password: {reset_token}
            
            This token will expire in 24 hours.
            
            If you did not request this reset, please ignore this email.
            
            Best regards,
            MsaadaPlus Team
            '''
            
            try:
                send_email(user.email, subject, body)
                return {'message': 'Password reset instructions sent to email'}, 200
            except Exception as e:
                db.session.rollback()
                return {'error': 'Failed to send reset email'}, 500
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

class ResetPassword(Resource):
    def post(self):
        try:
            data = request.get_json()
            
            if not all(key in data for key in ['email', 'reset_token', 'new_password']):
                return {'error': 'Email, reset token, and new password are required'}, 400
            
            if not validate_password(data['new_password']):
                return {'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'}, 400
            
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            if not user.reset_token or user.reset_token != data['reset_token']:
                return {'error': 'Invalid reset token'}, 400
            
            if user.reset_token_expires < datetime.utcnow():
                return {'error': 'Reset token has expired'}, 400
            
            user.password = data['new_password']
            user.reset_token = None
            user.reset_token_expires = None
            db.session.commit()
            
            return {'message': 'Password reset successful'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

class Charity(Resource):
    @jwt_required()
    def get(self):
        try:
            # Get query parameters
            status = request.args.get('status')
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            search = request.args.get('search', '')

            # Get current user's type from JWT claims
            current_user_id = get_jwt_identity()
            current_user = db.session.get(User, current_user_id)
            
            if not current_user:
                return {'error': 'User not found'}, 404

            # Build base query
            query = db.session.query(CharityProfile)

            # Apply status filter
            if current_user.user_type == UserType.ADMIN:
                if status:
                    try:
                        charity_status = CharityStatus(status)
                        query = query.filter(CharityProfile.status == charity_status)
                    except ValueError:
                        return {'error': 'Invalid status value'}, 400
                # If no status specified, show all charities for admin
            else:
                # Non-admins can only see approved charities
                query = query.filter(CharityProfile.status == CharityStatus.APPROVED)

            # Apply search filter if provided
            if search:
                search_term = f"%{search}%"
                query = query.filter(
                    db.or_(
                        CharityProfile.name.ilike(search_term),
                        CharityProfile.description.ilike(search_term)
                    )
                )

            # Execute paginated query
            paginated_charities = query.paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )

            # Prepare response data
            charities = []
            for charity in paginated_charities.items:
                # Get total donation amount
                total_donations = db.session.query(
                    db.func.sum(Donation.amount)
                ).filter(
                    Donation.charity_id == charity.id,
                    Donation.payment_status == 'completed'
                ).scalar() or 0

                # Get donor count (excluding anonymous donors)
                donor_count = db.session.query(
                    db.func.count(db.distinct(DonorProfile.id))
                ).join(
                    Donation, Donation.donor_id == DonorProfile.id
                ).filter(
                    Donation.charity_id == charity.id,
                    DonorProfile.is_anonymous == False
                ).scalar() or 0

                charity_data = {
                    'id': charity.id,
                    'name': charity.name,
                    'description': charity.description,
                    'contact_email': charity.contact_email,
                    'contact_phone': charity.contact_phone,
                    'status': charity.status.value,  # Added status to response
                    'registration_number': charity.reqistration_number,  # Added registration number
                    'total_donations': float(total_donations),
                    'donor_count': donor_count,
                    'beneficiary_count': len(charity.beneficiaries),
                    'story_count': len(charity.stories),
                    'stories': [{
                        'id': story.id,
                        'title': story.title,
                        'content': story.content,
                        'image_url': story.image_url,
                        'created_at': story.created_at.strftime('%Y-%m-%d')
                    } for story in charity.stories[:3]]  # Include only the 3 most recent stories
                }
                charities.append(charity_data)

            return {
                'charities': charities,
                'pagination': {
                    'total_items': paginated_charities.total,
                    'total_pages': paginated_charities.pages,
                    'current_page': page,
                    'per_page': per_page,
                    'has_next': paginated_charities.has_next,
                    'has_prev': paginated_charities.has_prev
                }
            }, 200

        except Exception as e:
            return {'error': str(e)}, 500

class CharityApplications(Resource):
    @jwt_required()
    def get(self):
        """Get all charity applications (Admin only)"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.ADMIN:
                return {'error': 'Unauthorized'}, 403
                
            # Get query parameters
            status = request.args.get('status', 'pending')
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            try:
                filter_status = CharityStatus(status)
            except ValueError:
                return {'error': 'Invalid status value'}, 400
                
            # Query applications
            query = CharityProfile.query.filter_by(status=filter_status)
            paginated_apps = query.paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            
            applications = [{
                'id': charity.id,
                'name': charity.name,
                'description': charity.description,
                'registration_number': charity.reqistration_number,
                'contact_email': charity.contact_email,
                'contact_phone': charity.contact_phone,
                'status': charity.status.value,
                'user_id': charity.user_id,
                'created_at': charity.user.created_at.strftime('%Y-%m-%d')
            } for charity in paginated_apps.items]
            
            return {
                'applications': applications,
                'pagination': {
                    'total_items': paginated_apps.total,
                    'total_pages': paginated_apps.pages,
                    'current_page': page,
                    'per_page': per_page,
                    'has_next': paginated_apps.has_next,
                    'has_prev': paginated_apps.has_prev
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
        
class CharityApplicationReview(Resource):
    @jwt_required()
    def post(self, charity_id):
        """Review (approve/reject) a charity application"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.ADMIN:
                return {'error': 'Unauthorized'}, 403
                
            data = request.get_json()
            if 'action' not in data:
                return {'error': 'Action (approve/reject) is required'}, 400
                
            action = data['action'].lower()
            if action not in ['approve', 'reject']:
                return {'error': 'Invalid action. Must be approve or reject'}, 400
                
            # Get charity profile
            charity = db.session.get(CharityProfile, charity_id)
            if not charity:
                return {'error': 'Charity not found'}, 404
                
            # Update status based on action
            if action == 'approve':
                charity.status = CharityStatus.APPROVED
                message = 'Charity application approved'
            else:
                charity.status = CharityStatus.REJECTED
                message = 'Charity application rejected'
                
            db.session.commit()
            
            # Send email notification to charity
            subject = f'MsaadaPlus - Charity Application {action.capitalize()}d'
            body = f'''
            Dear {charity.name},
            
            Your charity application has been {action}d.
            
            {'You can now setup a campaign and start receiving donations.' if action == 'approve' else 'If you believe this was a mistake, please contact our support team.'}
            
            Best regards,
            MsaadaPlus Team
            '''
            
            try:
                send_email(charity.contact_email, subject, body)
            except Exception as e:
                print(f"Error sending email: {e}")
                
            return {'message': message}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

class CharityDetail(Resource):
    @jwt_required()
    def delete(self, charity_id):
        """Delete a charity (Admin only)"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.ADMIN:
                return {'error': 'Unauthorized'}, 403
                
            # Get charity profile
            charity = db.session.get(CharityProfile, charity_id)
            if not charity:
                return {'error': 'Charity not found'}, 404
                
            # Delete associated records first (due to foreign key constraints)
            # Delete inventory items
            InventoryItem.query.filter_by(charity_id=charity_id).delete()
            
            # Delete stories
            Story.query.filter_by(charity_id=charity_id).delete()
            
            # Delete beneficiaries
            Beneficiary.query.filter_by(charity_id=charity_id).delete()
            
            # Delete donations
            Donation.query.filter_by(charity_id=charity_id).delete()
            
            # Delete recurring donations
            RecurringDonation.query.filter_by(charity_id=charity_id).delete()
            
            # Delete the charity profile
            db.session.delete(charity)
            db.session.commit()
            
            return {'message': 'Charity deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
        
    @jwt_required()
    def get(self, charity_id):
        """Get details of a specific charity"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)

            # Get charity profile
            charity = db.session.get(CharityProfile, charity_id)
            if not charity:
                return {'error': 'Charity not found'}, 404

            # Check if the user is an admin or the charity owner
            if user:
                # Serialize the charity profile
                charity_data = {
                    'id': charity.id,
                    'name': charity.name,
                    'description': charity.description,
                    'registration_number': charity.reqistration_number,
                    'status': charity.status,
                    'contact_email': charity.contact_email,
                    'contact_phone': charity.contact_phone,
                    'bank_account': charity.bank_account
                }

                # Get associated data
                beneficiaries = [
                    {
                        'id': b.id,
                        'name': b.name,
                        'age': b.age,
                        'school': b.school,
                        'location': b.location
                    } for b in charity.beneficiaries
                ]

                stories = [
                    {
                        'id': s.id,
                        'title': s.title,
                        'content': s.content,
                        'image_url': s.image_url,
                        'created_at': s.created_at.strftime('%Y-%m-%d')
                    } for s in charity.stories
                ]

                inventory_items = [
                    {
                        'id': i.id,
                        'name': i.name,
                        'quantity': i.quantity,
                        'beneficiary_id': i.beneficiary_id,
                    } for i in charity.inventory_items
                ]

                charity_data['beneficiaries'] = beneficiaries
                charity_data['stories'] = stories
                charity_data['inventory_items'] = inventory_items

                return charity_data, 200
            else:
                return {'error': 'Unauthorized'}, 403

        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
        
class Stories(Resource):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    def allowed_file(self, filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS

    def validate_file_size(self, file):
        file.seek(0, 2)  # Seek to end of file
        size = file.tell()  # Get current position (size)
        file.seek(0)  # Reset file position
        return size <= self.MAX_FILE_SIZE

    @jwt_required()
    def post(self):
        """Create a new story with improved image upload handling"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.CHARITY:
                return {'error': 'Unauthorized'}, 403
            
            if not user.charity_profile:
                return {'error': 'Charity profile not found'}, 404
            
            # Validate form data
            title = request.form.get('title')
            content = request.form.get('content')
            
            if not title or not content:
                return {'error': 'Missing required fields: title, content'}, 400
            
            # Handle image upload with improved validation
            image_url = None
            if 'image' in request.files:
                image_file = request.files['image']
                if image_file.filename == '':
                    return {'error': 'No selected file'}, 400
                    
                if not self.allowed_file(image_file.filename):
                    return {'error': f'Invalid file type. Allowed types: {", ".join(self.ALLOWED_EXTENSIONS)}'}, 400
                    
                if not self.validate_file_size(image_file):
                    return {'error': f'File size exceeds maximum limit of {self.MAX_FILE_SIZE/1024/1024}MB'}, 400
                
                try:
                    image_url = upload_image_to_cloudinary(image_file)
                except Exception as e:
                    return {"error": f"Image upload failed: {str(e)}"}, 500
            
            # Create new story
            new_story = Story(
                charity_id=user.charity_profile.id,
                title=title,
                content=content,
                image_url=image_url,
                created_at=datetime.utcnow()
            )
            
            db.session.add(new_story)
            db.session.commit()
            
            return {
                'message': 'Story created successfully',
                'story': {
                    'id': new_story.id,
                    'title': new_story.title,
                    'content': new_story.content,
                    'image_url': new_story.image_url,
                    'created_at': new_story.created_at.strftime('%Y-%m-%d')
                }
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
        
    @jwt_required()
    def get(self):
        """Get all stories for a charity"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.CHARITY:
                return {'error': 'Unauthorized'}, 403
            
            if not user.charity_profile:
                return {'error': 'Charity profile not found'}, 404
                
            # Get query parameters for pagination
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            # Query stories with pagination
            stories = Story.query.filter_by(
                charity_id=user.charity_profile.id
            ).order_by(
                Story.created_at.desc()
            ).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            
            return {
                'stories': [{
                    'id': story.id,
                    'title': story.title,
                    'content': story.content,
                    'image_url': story.image_url,
                    'created_at': story.created_at.strftime('%Y-%m-%d')
                } for story in stories.items],
                'pagination': {
                    'total_items': stories.total,
                    'total_pages': stories.pages,
                    'current_page': page,
                    'per_page': per_page,
                    'has_next': stories.has_next,
                    'has_prev': stories.has_prev
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

class Beneficiaries(Resource):
    @jwt_required()
    def post(self):
        """Create a new beneficiary"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.CHARITY:
                return {'error': 'Unauthorized'}, 403
            
            if not user.charity_profile:
                return {'error': 'Charity profile not found'}, 404
                
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name']
            if not all(field in data for field in required_fields):
                return {'error': f'Missing required fields: {", ".join(required_fields)}'}, 400
                
            new_beneficiary = Beneficiary(
                charity_id=user.charity_profile.id,
                name=data['name'],
                age=data.get('age'),
                school=data.get('school'),
                location=data.get('location')
            )
            
            db.session.add(new_beneficiary)
            db.session.commit()
            
            return {
                'message': 'Beneficiary created successfully',
                'beneficiary': {
                    'id': new_beneficiary.id,
                    'name': new_beneficiary.name,
                    'age': new_beneficiary.age,
                    'school': new_beneficiary.school,
                    'location': new_beneficiary.location
                }
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @jwt_required()
    def get(self):
        """Get all beneficiaries for a charity"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.CHARITY:
                return {'error': 'Unauthorized'}, 403
            
            if not user.charity_profile:
                return {'error': 'Charity profile not found'}, 404
                
            # Get query parameters for pagination
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            # Query beneficiaries with pagination
            beneficiaries = Beneficiary.query.filter_by(
                charity_id=user.charity_profile.id
            ).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            
            return {
                'beneficiaries': [{
                    'id': beneficiary.id,
                    'name': beneficiary.name,
                    'age': beneficiary.age,
                    'school': beneficiary.school,
                    'location': beneficiary.location
                } for beneficiary in beneficiaries.items],
                'pagination': {
                    'total_items': beneficiaries.total,
                    'total_pages': beneficiaries.pages,
                    'current_page': page,
                    'per_page': per_page,
                    'has_next': beneficiaries.has_next,
                    'has_prev': beneficiaries.has_prev
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

class Inventory(Resource):
    @jwt_required()
    def post(self):
        """Add new inventory item"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.CHARITY:
                return {'error': 'Unauthorized'}, 403
            
            if not user.charity_profile:
                return {'error': 'Charity profile not found'}, 404
                
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'quantity']
            if not all(field in data for field in required_fields):
                return {'error': f'Missing required fields: {", ".join(required_fields)}'}, 400
                
            # Validate beneficiary if provided
            beneficiary_id = data.get('beneficiary_id')
            if beneficiary_id:
                beneficiary = db.session.get(Beneficiary, beneficiary_id)
                if not beneficiary or beneficiary.charity_id != user.charity_profile.id:
                    return {'error': 'Invalid beneficiary ID'}, 400
                
            new_item = InventoryItem(
                charity_id=user.charity_profile.id,
                name=data['name'],
                quantity=data['quantity'],
                beneficiary_id=beneficiary_id,
                distribution_date=datetime.strptime(data['distribution_date'], '%Y-%m-%d') if 'distribution_date' in data else None
            )
            
            db.session.add(new_item)
            db.session.commit()
            
            return {
                'message': 'Inventory item added successfully',
                'item': {
                    'id': new_item.id,
                    'name': new_item.name,
                    'quantity': new_item.quantity,
                    'beneficiary_id': new_item.beneficiary_id,
                    'distribution_date': new_item.distribution_date.strftime('%Y-%m-%d') if new_item.distribution_date else None
                }
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @jwt_required()
    def get(self):
        """Get all inventory items for a charity"""
        try:
            # Get current user
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user or user.user_type != UserType.CHARITY:
                return {'error': 'Unauthorized'}, 403
            
            if not user.charity_profile:
                return {'error': 'Charity profile not found'}, 404
                
            # Get query parameters for pagination and filtering
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            beneficiary_id = request.args.get('beneficiary_id', type=int)
            
            # Build query
            query = InventoryItem.query.filter_by(charity_id=user.charity_profile.id)
            if beneficiary_id:
                query = query.filter_by(beneficiary_id=beneficiary_id)
                
            # Execute query with pagination
            inventory = query.paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            
            return {
                'inventory': [{
                    'id': item.id,
                    'name': item.name,
                    'quantity': item.quantity,
                    'beneficiary_id': item.beneficiary_id,
                    'distribution_date': item.distribution_date.strftime('%Y-%m-%d') if item.distribution_date else None,
                    'created_at': item.created_at.strftime('%Y-%m-%d')
                } for item in inventory.items],
                'pagination': {
                    'total_items': inventory.total,
                    'total_pages': inventory.pages,
                    'current_page': page,
                    'per_page': per_page,
                    'has_next': inventory.has_next,
                    'has_prev': inventory.has_prev
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500


class DonationResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()

        donor_profile = DonorProfile.query.filter_by(user_id=user_id).first()
        if not donor_profile:
            return {'message': 'Donor profile not found'}, 404

        charity_profile = db.session.get(CharityProfile, data['charity_id'])
        if not charity_profile:
            return {'message': 'Charity profile not found'}, 404

        # Ensure 'amount' is present in the data payload
        amount = data.get('amount')
        if not amount:
            return {'message': 'Donation amount is required'}, 400

        # Create Donation entry
        donation = Donation(
            donor_id=donor_profile.id,
            charity_id=charity_profile.id,
            amount=amount,
            donation_type=data.get('donation_type')
        )
        db.session.add(donation)
        db.session.commit()

        # Initiate M-Pesa Payment
        try:
            access_token = generate_daraja_token()
            payment_url = f"{DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S') 
            password = base64.b64encode(f"{DARAJA_SHORTCODE}{DARAJA_PASSKEY}{timestamp}".encode()).decode('utf-8')
            payload = {
                "BusinessShortCode": DARAJA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": donor_profile.phone,
                "PartyB": DARAJA_SHORTCODE,
                "PhoneNumber": donor_profile.phone,
                "CallBackURL": "https://mydomain.com/path",
                "AccountReference": f"Donation-{donation.id}",
                "TransactionDesc": f"Payment for Donation number-{donation.id}"
            }

            response = requests.post(payment_url, json=payload, headers=headers)
            response_json = response.json()

            if response_json.get("ResponseCode") == "0":
                return {
                    'message': 'Order placed successfully, awaiting payment confirmation',
                    'donation_id': donation.id,
                    'amount': amount,
                    'payment_request': response_json
                }, 201
            else:
                return {
                    'message': 'Failed to initiate payment',
                    'error': response_json
                }, 400

        except requests.exceptions.RequestException as e:
            return {
                'message': 'An error occurred while initiating payment',
                'error': str(e)
            }, 500


class RecurringDonationResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()

        # Verify donor profile
        donor_profile = DonorProfile.query.filter_by(user_id=user_id).first()
        if not donor_profile:
            return {'message': 'Donor profile not found'}, 404

        # Verify charity profile
        charity_profile = CharityProfile.query.get(data.get('charity_id'))
        if not charity_profile:
            return {'message': 'Charity profile not found'}, 404

        # Validate donation data
        amount = data.get('amount')
        frequency = data.get('frequency')

        if not amount:
            return {'message': 'Donation amount is required'}, 400
        if not frequency:
            return {'message': 'Donation frequency is required'}, 400

        # Calculate next donation date based on frequency
        current_date = datetime.now()
        next_donation_date = self.calculate_next_donation_date(current_date, frequency)
        if not next_donation_date:
            return {'message': 'Invalid donation frequency'}, 400

        # Create the recurring donation entry
        recurring_donation = RecurringDonation(
            donor_id=donor_profile.id,
            charity_id=charity_profile.id,
            amount=amount,
            frequency=frequency,
            next_donation_date=next_donation_date
        )

        db.session.add(recurring_donation)
        db.session.commit()

        try:
            access_token = generate_daraja_token()
            payment_url = f"{DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            timestamp = current_date.strftime('%Y%m%d%H%M%S') 
            password = base64.b64encode(f"{DARAJA_SHORTCODE}{DARAJA_PASSKEY}{timestamp}".encode()).decode('utf-8')
            payload = {
                "BusinessShortCode": DARAJA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": donor_profile.phone,
                "PartyB": DARAJA_SHORTCODE,
                "PhoneNumber": donor_profile.phone,
                "CallBackURL": "https://mydomain.com/path",
                "AccountReference": f"RecurringDonation-{recurring_donation.id}",
                "TransactionDesc": f"Recurring donation payment for donation-{recurring_donation.id}"
            }

            response = requests.post(payment_url, json=payload, headers=headers)
            response_json = response.json()

            if response_json.get("ResponseCode") == "0":
                return {
                    'message': 'Recurring donation created successfully, awaiting payment confirmation',
                    'recurring_donation_id': recurring_donation.id,
                    'amount': amount,
                    'next_donation_date': next_donation_date.strftime('%Y-%m-%d'),
                    'payment_request': response_json
                }, 201
            else:
                return {
                    'message': 'Failed to initiate payment',
                    'error': response_json
                }, 400

        except requests.exceptions.RequestException as e:
            return {
                'message': 'An error occurred while initiating payment',
                'error': str(e)
            }, 500

    def calculate_next_donation_date(self, current_date, frequency):
        """Calculate the next donation date based on frequency."""
        if frequency == DonationType.MONTHLY:
            # Add one month to the current date
            month = current_date.month + 1 if current_date.month < 12 else 1
            year = current_date.year if current_date.month < 12 else current_date.year + 1
            day = min(current_date.day, calendar.monthrange(year, month)[1])  # Ensures valid day in month
            return current_date.replace(year=year, month=month, day=day)
        elif frequency == DonationType.QUARTERLY:
            # Add three months (one quarter) to the current date
            month = current_date.month + 3
            year = current_date.year
            if month > 12:
                month -= 12
                year += 1
            day = min(current_date.day, calendar.monthrange(year, month)[1])
            return current_date.replace(year=year, month=month, day=day)
        elif frequency == DonationType.ANNUALLY:
            # Add one year to the current date
            return current_date.replace(year=current_date.year + 1)
        else:
            return None  # Invalid frequency
        

api.add_resource(DonationResource, '/donation')
api.add_resource(RecurringDonationResource, '/recurring-donation')
api.add_resource(Stories, '/stories')
api.add_resource(Beneficiaries, '/beneficiaries')
api.add_resource(Inventory, '/inventory')
api.add_resource(ProfileDetails, '/profile-details')
api.add_resource(Register, '/register')
api.add_resource(VerifyEmail, '/verify-email')
api.add_resource(ResendVerification, '/resend-verification')
api.add_resource(Login, '/login')
api.add_resource(UpdateProfile, '/update-profile')
api.add_resource(RequestPasswordReset, '/password/reset-request')
api.add_resource(ResetPassword, '/password/reset')
api.add_resource(Charity, '/charities')
api.add_resource(CharityApplications, '/charity/applications')
api.add_resource(CharityApplicationReview, '/charity/applications/<int:charity_id>/review')
api.add_resource(CharityDetail, '/charity/<int:charity_id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)