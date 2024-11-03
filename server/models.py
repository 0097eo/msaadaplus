from config import db, bcrypt
from datetime import datetime
from sqlalchemy.orm import validates
from sqlalchemy import Enum, func
import enum

class UserType(str, enum.Enum):
    DONOR = "donor"
    CHARITY = "charity"
    ADMIN = "admin"

class DonationType(str, enum.Enum):
    ONE_TIME = "one_time"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"

class CharityStatus(str, enum.Enum):
    APPROVED = "approved"
    PENDING = "pending"
    REJECTED = "rejected"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False)
    verification_code = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    #Rlshps
    donor_profile = db.relationship('DonorProfile', backref='user', uselist=False)
    charity_profile = db.relationship('CharityProfile', backref='user', uselist=False)

    @property
    def password(self):
        return AttributeError('password is not readable')
    
    @password.setter
    def password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class DonorProfile(db.Model):
    __tablename__ = 'donor_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    is_anonymous = db.Column(db.Boolean, default=False)
    notification_preference = db.Column(db.Boolean, default=True)

    #Rlshps
    donations = db.relationship('Donation', backref='donor_profile')
    recurring_donations = db.relationship('RecurringDonation', backref='donor_profile')

class CharityProfile(db.Model):
    __tablename__ = 'charity_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    reqistration_number = db.Column(db.String(50), unique=True)
    status = db.Column(db.Enum(CharityStatus), default=CharityStatus.PENDING)
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    bank_account = db.Column(db.String(255))

    # Relshps
    beneficiaries = db.relationship('Beneficiary', backref='charity_profile')
    stories = db.relationship('Story', backref='charity_profile')
    donations = db.relationship('Donation', backref='charity_profile')
    inventory_items = db.relationship('InventoryItem', backref='charity_profile')

class Beneficiary(db.Model):
    __tablename__ = 'beneficiaries'

    id = db.Column(db.Integer, primary_key=True)
    charity_id = db.Column(db.Integer, db.ForeignKey('charity_profiles.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    school = db.Column(db.String(255))
    location = db.Column(db.String(150))

class Story(db.Model):
    __tablename__ = 'stories'

    id = db.Column(db.Integer, primary_key=True)
    charity_id = db.Column(db.Integer, db.ForeignKey('charity_profiles.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=func.now())

class Donation(db.Model):
    __tablename__ = 'donations'

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('donor_profiles.id'), nullable=False)
    charity_id = db.Column(db.Integer, db.ForeignKey('charity_profiles.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    donation_type = db.Column(db.Enum(DonationType), nullable=False)
    payment_status = db.Column(db.String(255), default='pending')
    created_at = db.Column(db.Date, default=func.now())

class RecurringDonation(db.Model):
    __tablename__ = 'recurring_donations'

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('donor_profiles.id'), nullable=False)
    charity_id = db.Column(db.Integer, db.ForeignKey('charity_profiles.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    frequency = db.Column(Enum(DonationType), nullable=False)
    next_donation_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.Date, default=func.now())

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    id = db.Column(db.Integer, primary_key=True)
    charity_id = db.Column(db.Integer, db.ForeignKey('charity_profiles.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    beneficiary_id = db.Column(db.Integer, db.ForeignKey('beneficiaries.id'))
    distribution_date = db.Column(db.DateTime)
    created_at = db.Column(db.Date, default=func.now())