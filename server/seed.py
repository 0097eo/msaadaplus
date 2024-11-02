from faker import Faker
from sqlalchemy.exc import IntegrityError
import random
from datetime import datetime, timedelta
from models import db, User, DonorProfile, CharityProfile, Beneficiary, Story, Donation, RecurringDonation, InventoryItem
from models import UserType, DonationType, CharityStatus
import cloudinary
import cloudinary.uploader
import cloudinary.api
from config import app
import requests
from io import BytesIO

fake = Faker()

# Fixed Unsplash URLs (removed the double https:)
SAMPLE_IMAGE_IDS = [
    "https://images.unsplash.com/photo-1544995228-a7a3abc39d89?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1531727991582-cfd25ce79613?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1522512115668-c09775d6f424?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1538330627166-33d1908c210d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1521510186458-bbbda7aef46b?q=80&w=1781&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1535588706069-af8f2d837332?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1528588522589-fa345f165593?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1556793521-e0454b213055?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1601291375621-12ec8bad71e2?q=80&w=1892&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1617394245839-76ee06b7f821?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
]


# Function to upload image to Cloudinary from Unsplash URL
def generate_image_url():
    try:
        # Get a random Unsplash image URL and add quality parameters
        base_url = random.choice(SAMPLE_IMAGE_IDS)
        full_url = f"{base_url}?q=80&w=800&auto=format&fit=crop"
        
        # Download the image from Unsplash
        response = requests.get(full_url)
        if response.status_code != 200:
            raise Exception(f"Failed to download image: {response.status_code}")
        
        # Upload the image data to Cloudinary
        result = cloudinary.uploader.upload(
            BytesIO(response.content),
            folder="charity_stories",  # Optional: organize images in a folder
            transformation={
                'width': 800,
                'height': 600,
                'crop': 'fill',
                'quality': 'auto:good'
            }
        )
        
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        # Return a fallback image URL if upload fails
        return "https://res.cloudinary.com/your-cloud-name/image/upload/v1/default-placeholder.jpg"

# Sample story contents for more realistic charity stories
SAMPLE_STORIES = [
    "Our recent education initiative has helped 50 children access quality schooling. Through community support and dedicated volunteers, we've been able to provide textbooks, uniforms, and daily meals to these students.",
    "Thanks to our donors' generosity, we successfully completed the construction of a new community center. This space will serve as a hub for educational programs, skill development workshops, and community gatherings.",
    "The winter clothing drive exceeded our expectations. We collected over 1,000 warm garments that have been distributed to homeless shelters across the city, helping hundreds stay warm during the cold months.",
    "Our medical camp served over 200 elderly residents last month. Free health check-ups, medications, and follow-up care were provided to those who otherwise couldn't afford these essential services.",
    "The youth mentorship program has paired 30 at-risk teenagers with professional mentors. Early results show improved school attendance and academic performance among participating students."
]

def seed_data():
    with app.app_context():
        print("🌱 Starting seeding...")
        
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        print("All data cleared from the database.")
        
        try:
            # Create admin user
            print("Creating admin user...")
            admin = User(
                email="admin@example.com",
                username="admin",
                password="admin123",
                user_type=UserType.ADMIN,
                verification_code=fake.uuid4()
            )
            db.session.add(admin)
            
            # Create donors
            print("Creating donors...")
            donors = []
            for _ in range(20):
                user = User(
                    email=fake.email(),
                    username=fake.user_name(),
                    password="password123",
                    user_type=UserType.DONOR,
                    verification_code=fake.uuid4()
                )
                db.session.add(user)
                db.session.flush()
                
                donor_profile = DonorProfile(
                    user_id=user.id,
                    full_name=fake.name(),
                    phone=fake.phone_number(),
                    is_anonymous=random.choice([True, False]),
                    notification_preference=random.choice([True, False])
                )
                db.session.add(donor_profile)
                donors.append(donor_profile)
            
            # Create charities
            print("Creating charities...")
            charities = []
            charity_names = [
                "Hope Foundation", "Children's Future", "Education First",
                "Food Bank Initiative", "Healthcare Access", "Environmental Care",
                "Animal Welfare Society", "Elder Care Plus", "Youth Development",
                "Community Support"
            ]
            
            for name in charity_names:
                user = User(
                    email=f"{name.lower().replace(' ', '')}@example.com",
                    username=name.lower().replace(' ', '_'),
                    password="charity123",
                    user_type=UserType.CHARITY,
                    verification_code=fake.uuid4()
                )
                db.session.add(user)
                db.session.flush()
                
                charity_profile = CharityProfile(
                    user_id=user.id,
                    name=name,
                    description=fake.paragraph(),
                    reqistration_number=fake.uuid4()[:8].upper(),
                    status=random.choice(list(CharityStatus)),
                    contact_email=fake.company_email(),
                    contact_phone=fake.phone_number(),
                    bank_account=fake.iban()
                )
                db.session.add(charity_profile)
                charities.append(charity_profile)
            
            db.session.flush()
            
            # Create beneficiaries
            print("Creating beneficiaries...")
            beneficiaries = []
            for charity in charities:
                for _ in range(random.randint(5, 10)):
                    beneficiary = Beneficiary(
                        charity_id=charity.id,
                        name=fake.name(),
                        age=random.randint(5, 85),
                        school=fake.company() if random.random() < 0.5 else None,
                        location=fake.city()
                    )
                    db.session.add(beneficiary)
                    beneficiaries.append(beneficiary)
        
            # Create stories with Cloudinary images
            print("Creating stories with Cloudinary images...")
            for charity in charities:
                for _ in range(random.randint(3, 7)):
                    try:
                        image_url = generate_image_url()
                        story = Story(
                            charity_id=charity.id,
                            title=fake.catch_phrase(),
                            content=random.choice(SAMPLE_STORIES),
                            image_url=image_url,
                            created_at=fake.date_time_between(start_date='-1y', end_date='now')
                        )
                        db.session.add(story)
                        db.session.flush()  # Flush after each story to catch any errors immediately
                    except Exception as e:
                        print(f"Error creating story: {str(e)}")
                        continue
            
            # Create donations
            print("Create donations...")
            donation_amounts = [10, 20, 50, 100, 200, 500, 1000]
            for _ in range(100):
                donation = Donation(
                    donor_id=random.choice(donors).id,
                    charity_id=random.choice(charities).id,
                    amount=random.choice(donation_amounts),
                    donation_type=random.choice(list(DonationType)),
                    payment_status=random.choice(['pending', 'completed', 'failed']),
                    created_at=fake.date_time_between(start_date='-1y', end_date='now')
                )
                db.session.add(donation)
            
            # Create recurring donations
            print("Creating recurring donations...")
            for _ in range(30):
                recurring = RecurringDonation(
                    donor_id=random.choice(donors).id,
                    charity_id=random.choice(charities).id,
                    amount=random.choice(donation_amounts),
                    frequency=random.choice(list(DonationType)),
                    next_donation_date=fake.future_date(),
                    is_active=random.choice([True, False]),
                    created_at=fake.date_time_between(start_date='-1y', end_date='now')
                )
                db.session.add(recurring)
            
            # Create inventory items
            print("Creating inventory items...")
            item_names = ["Books", "School Supplies", "Food Packages", "Clothing", "Medical Supplies", 
                        "Hygiene Kits", "Blankets", "Toys", "Electronics", "Sports Equipment"]
            
            for charity in charities:
                for _ in range(random.randint(5, 15)):
                    item = InventoryItem(
                        charity_id=charity.id,
                        name=random.choice(item_names),
                        quantity=random.randint(1, 1000),
                        beneficiary_id=random.choice(beneficiaries).id if random.random() < 0.3 else None,
                        distribution_date=fake.future_date() if random.random() < 0.5 else None,
                        created_at=fake.date_time_between(start_date='-1y', end_date='now')
                    )
                    db.session.add(item)
            
            db.session.commit()
            print("✅ Seeding completed successfully!")
            
        except IntegrityError as e:
            db.session.rollback()
            print(f"❌ Error seeding database: {str(e)}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    # Configure Cloudinary
    cloudinary.config(
    cloud_name='dmze7emzl',
    api_key='879125659435828',
    api_secret='EP7n75hw2qvKo05IaAJv40RiW0o'
)
    seed_data()