from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import re
import os

app = Flask(__name__)

# Set configuration directly to avoid .env file issues
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'postgresql://postgres:postgres@localhost:5432/WorkShop_09')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Enable CORS for all routes
CORS(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=False)
    graduation_year = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    registrations = db.relationship('Registration', backref='user', lazy=True)

class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(5), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    image = db.Column(db.String(500))
    status = db.Column(db.String(20), default='active')
    organizer = db.Column(db.String(100), default='University')
    tags = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    registrations = db.relationship('Registration', backref='event', lazy=True)

class Registration(db.Model):
    __tablename__ = 'registrations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_status = db.Column(db.String(20), default='pending')
    payment_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date = db.Column(db.DateTime)

# API Routes
@app.get("/health")
def health():
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
    
    return jsonify({
        "status": "ok", 
        "timestamp": datetime.now().isoformat(),
        "database": db_status
    }), 200

@app.get("/events")
def get_events():
    """Get all events with optional filtering"""
    category = request.args.get('category')
    status = request.args.get('status')
    search = request.args.get('search')
    
    query = Event.query
    
    if category:
        query = query.filter(Event.category == category)
    
    if status:
        query = query.filter(Event.status == status)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Event.title.ilike(search_filter),
                Event.description.ilike(search_filter)
            )
        )
    
    events = query.all()
    
    # Convert to JSON-serializable format
    events_data = []
    for event in events:
        event_dict = {
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'date': event.date.isoformat() if event.date else None,
            'time': event.time,
            'location': event.location,
            'category': event.category,
            'capacity': event.capacity,
            'price': float(event.price) if event.price else 0.00,
            'image': event.image,
            'status': event.status,
            'organizer': event.organizer,
            'tags': event.tags or [],
            'created_at': event.created_at.isoformat() if event.created_at else None
        }
        events_data.append(event_dict)
    
    return jsonify(events_data), 200

@app.get("/events/<int:event_id>")
def get_event(event_id):
    """Get a specific event by ID"""
    event = Event.query.get_or_404(event_id)
    
    # Get registration count
    registered_count = Registration.query.filter_by(event_id=event_id).count()
    
    event_data = {
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'date': event.date.isoformat() if event.date else None,
        'time': event.time,
        'location': event.location,
        'category': event.category,
        'capacity': event.capacity,
        'price': float(event.price) if event.price else 0.00,
        'image': event.image,
        'status': event.status,
        'organizer': event.organizer,
        'tags': event.tags or [],
        'created_at': event.created_at.isoformat() if event.created_at else None,
        'registered_count': registered_count,
        'available_spots': event.capacity - registered_count
    }
    
    return jsonify(event_data), 200

@app.post("/events")
def add_event():
    """Add a new event (Admin only)"""
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    # Validate required fields
    required_fields = ["title", "description", "date", "time", "location", "category", "capacity", "price"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"{field} is required"}), 400

    # Validate date format
    try:
        event_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"status": "error", "message": "date must be in YYYY-MM-DD format"}), 400

    # Validate time format
    if not re.match(r"^\d{2}:\d{2}$", data['time']):
        return jsonify({"status": "error", "message": "time must be in HH:MM format"}), 400

    # Create new event
    new_event = Event(
        title=data['title'].strip(),
        description=data['description'].strip(),
        date=event_date,
        time=data['time'],
        location=data['location'].strip(),
        category=data['category'],
        capacity=int(data['capacity']),
        price=data['price'],
        image=data.get('image', ''),
        status=data.get('status', 'active'),
        organizer=data.get('organizer', 'University'),
        tags=data.get('tags', [])
    )
    
    try:
        db.session.add(new_event)
        db.session.commit()
        
        # Return the created event
        event_data = {
            'id': new_event.id,
            'title': new_event.title,
            'description': new_event.description,
            'date': new_event.date.isoformat(),
            'time': new_event.time,
            'location': new_event.location,
            'category': new_event.category,
            'capacity': new_event.capacity,
            'price': float(new_event.price),
            'image': new_event.image,
            'status': new_event.status,
            'organizer': new_event.organizer,
            'tags': new_event.tags or [],
            'created_at': new_event.created_at.isoformat()
        }
        
        return jsonify({"status": "success", "event": event_data}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

@app.put("/events/<int:event_id>")
def update_event(event_id):
    """Update an existing event (Admin only)"""
    event = Event.query.get_or_404(event_id)
    
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    # Update fields
    if 'title' in data:
        event.title = data['title'].strip()
    if 'description' in data:
        event.description = data['description'].strip()
    if 'date' in data:
        try:
            event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"status": "error", "message": "date must be in YYYY-MM-DD format"}), 400
    if 'time' in data:
        if not re.match(r"^\d{2}:\d{2}$", data['time']):
            return jsonify({"status": "error", "message": "time must be in HH:MM format"}), 400
        event.time = data['time']
    if 'location' in data:
        event.location = data['location'].strip()
    if 'category' in data:
        event.category = data['category']
    if 'capacity' in data:
        event.capacity = int(data['capacity'])
    if 'price' in data:
        event.price = data['price']
    if 'image' in data:
        event.image = data['image']
    if 'status' in data:
        event.status = data['status']
    if 'organizer' in data:
        event.organizer = data['organizer']
    if 'tags' in data:
        event.tags = data['tags']

    try:
        db.session.commit()
        
        # Return updated event
        event_data = {
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'date': event.date.isoformat() if event.date else None,
            'time': event.time,
            'location': event.location,
            'category': event.category,
            'capacity': event.capacity,
            'price': float(event.price) if event.price else 0.00,
            'image': event.image,
            'status': event.status,
            'organizer': event.organizer,
            'tags': event.tags or [],
            'created_at': event.created_at.isoformat() if event.created_at else None
        }
        
        return jsonify({"status": "success", "event": event_data}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

@app.delete("/events/<int:event_id>")
def delete_event(event_id):
    """Delete an event (Admin only)"""
    event = Event.query.get_or_404(event_id)
    
    try:
        # Delete related registrations first
        Registration.query.filter_by(event_id=event_id).delete()
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Event deleted"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

DEFAULT_CATEGORIES = [
    "Technology", "Cultural", "Career", "Sports", "Academic",
    "Workshop", "Seminar", "Concert", "Exhibition", "Other"
]

@app.get("/categories")
def get_categories():
    """Get all event categories"""
    categories = db.session.query(Event.category).distinct().all()
    cats = [cat[0] for cat in categories if cat[0]]
    if not cats:
        cats = DEFAULT_CATEGORIES
    return jsonify(cats), 200

@app.get("/users")
def get_users():
    """Get all users (students)"""
    users = User.query.all()
    
    users_data = []
    for user in users:
        user_dict = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'student_id': user.student_id,
            'department': user.department,
            'graduation_year': user.graduation_year,
            'phone': user.phone,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }
        users_data.append(user_dict)
    
    return jsonify(users_data), 200

@app.post("/users")
def add_user():
    """Add a new user (student registration)"""
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    required_fields = ["name", "email", "student_id", "department", "graduation_year"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"{field} is required"}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    # Check if student ID already exists
    if User.query.filter_by(student_id=data['student_id']).first():
        return jsonify({"status": "error", "message": "Student ID already registered"}), 400

    new_user = User(
        name=data['name'].strip(),
        email=data['email'].strip(),
        student_id=data['student_id'].strip(),
        department=data['department'],
        graduation_year=int(data['graduation_year']),
        phone=data.get('phone', '')
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        user_data = {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'student_id': new_user.student_id,
            'department': new_user.department,
            'graduation_year': new_user.graduation_year,
            'phone': new_user.phone,
            'created_at': new_user.created_at.isoformat() if new_user.created_at else None
        }
        
        return jsonify({"status": "success", "user": user_data}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

@app.post("/events/<int:event_id>/register")
def register_for_event(event_id):
    """Register a user for an event"""
    event = Event.query.get_or_404(event_id)
    
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "user_id is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    # Check if already registered
    if Registration.query.filter_by(event_id=event_id, user_id=user_id).first():
        return jsonify({"status": "error", "message": "Already registered for this event"}), 400

    # Check capacity
    registered_count = Registration.query.filter_by(event_id=event_id).count()
    if registered_count >= event.capacity:
        return jsonify({"status": "error", "message": "Event is full"}), 400

    # Create registration
    registration = Registration(
        event_id=event_id,
        user_id=user_id,
        amount=event.price
    )
    
    try:
        db.session.add(registration)
        db.session.commit()
        
        registration_data = {
            'id': registration.id,
            'event_id': registration.event_id,
            'user_id': registration.user_id,
            'registration_date': registration.registration_date.isoformat() if registration.registration_date else None,
            'payment_status': registration.payment_status,
            'payment_id': registration.payment_id,
            'amount': float(registration.amount) if registration.amount else 0.00
        }
        
        return jsonify({
            "status": "success", 
            "registration": registration_data,
            "message": "Registration successful! Please complete payment."
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

@app.post("/payments/process")
def process_payment():
    """Process payment for event registration (simulated)"""
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    payment_id = data.get('payment_id')
    amount = data.get('amount')
    card_number = data.get('card_number')
    
    if not all([payment_id, amount, card_number]):
        return jsonify({"status": "error", "message": "Missing payment details"}), 400

    # Find the registration
    registration = Registration.query.filter_by(payment_id=payment_id).first()
    if not registration:
        return jsonify({"status": "error", "message": "Registration not found"}), 404

    # Simulate payment processing
    import time
    time.sleep(1)  # Simulate processing time
    
    # Simulate payment success (90% success rate)
    import random
    if random.random() < 0.9:
        # Update registration payment status
        registration.payment_status = 'completed'
        registration.payment_date = datetime.utcnow()
        
        try:
            db.session.commit()
            
            return jsonify({
                "status": "success",
                "message": "Payment processed successfully",
                "transaction_id": str(uuid.uuid4()),
                "amount": amount
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500
    else:
        return jsonify({
            "status": "error",
            "message": "Payment failed. Please try again."
        }), 400

@app.get("/registrations")
def get_registrations():
    """Get all registrations (Admin only)"""
    registrations = Registration.query.all()
    
    registrations_data = []
    for reg in registrations:
        reg_data = {
            'id': reg.id,
            'event_id': reg.event_id,
            'user_id': reg.user_id,
            'registration_date': reg.registration_date.isoformat() if reg.registration_date else None,
            'payment_status': reg.payment_status,
            'payment_id': reg.payment_id,
            'amount': float(reg.amount) if reg.amount else 0.00,
            'payment_date': reg.payment_date.isoformat() if reg.payment_date else None,
            'user': {
                'name': reg.user.name,
                'email': reg.user.email,
                'student_id': reg.user.student_id
            } if reg.user else None,
            'event': {
                'title': reg.event.title,
                'date': reg.event.date.isoformat() if reg.event.date else None
            } if reg.event else None
        }
        registrations_data.append(reg_data)
    
    return jsonify(registrations_data), 200

@app.get("/dashboard/stats")
def get_dashboard_stats():
    """Get dashboard statistics (Admin only)"""
    try:
        total_events = Event.query.count()
        total_users = User.query.count()
        total_registrations = Registration.query.count()
        
        # Calculate total revenue from completed payments
        completed_registrations = Registration.query.filter_by(payment_status='completed').all()
        total_revenue = sum(float(reg.amount) for reg in completed_registrations)
        
        # Events by category
        category_stats = {}
        categories = db.session.query(Event.category, db.func.count(Event.id)).group_by(Event.category).all()
        for category, count in categories:
            category_stats[category] = count
        
        # Recent registrations
        recent_registrations = Registration.query.order_by(Registration.registration_date.desc()).limit(5).all()
        recent_data = []
        for reg in recent_registrations:
            reg_data = {
                'id': reg.id,
                'registration_date': reg.registration_date.isoformat() if reg.registration_date else None,
                'user': {
                    'name': reg.user.name,
                    'email': reg.user.email
                } if reg.user else None,
                'event': {
                    'title': reg.event.title
                } if reg.event else None
            }
            recent_data.append(reg_data)
        
        return jsonify({
            "total_events": total_events,
            "total_users": total_users,
            "total_registrations": total_registrations,
            "total_revenue": total_revenue,
            "category_stats": category_stats,
            "recent_registrations": recent_data
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

# Database initialization
@app.cli.command("init-db")
def init_db():
    """Initialize the database with tables and sample data"""
    db.create_all()
    
    # Add sample data if tables are empty
    if Event.query.count() == 0:
        sample_events = [
            Event(
                title="Tech Hackathon 2025",
                description="Join us for an exciting 48-hour coding challenge!",
                date=datetime.strptime("2025-09-01", "%Y-%m-%d").date(),
                time="09:00",
                location="Main Campus Auditorium",
                category="Technology",
                capacity=100,
                price=25.00,
                image="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400",
                status="active",
                organizer="Computer Science Department",
                tags=["coding", "innovation", "networking"]
            ),
            Event(
                title="Cultural Fest 2025",
                description="Celebrate diversity through music, dance, and art!",
                date=datetime.strptime("2025-09-15", "%Y-%m-%d").date(),
                time="18:00",
                location="University Amphitheater",
                category="Cultural",
                capacity=200,
                price=15.00,
                image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
                status="active",
                organizer="Student Affairs",
                tags=["culture", "arts", "celebration"]
            ),
            Event(
                title="Career Fair 2025",
                description="Connect with top employers and explore career opportunities!",
                date=datetime.strptime("2025-10-01", "%Y-%m-%d").date(),
                time="10:00",
                location="Business School",
                category="Career",
                capacity=300,
                price=0.00,
                image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
                status="active",
                organizer="Career Services",
                tags=["career", "networking", "jobs"]
            )
        ]
        
        for event in sample_events:
            db.session.add(event)
    
    if User.query.count() == 0:
        sample_users = [
            User(
                name="John Doe",
                email="john@student.edu",
                student_id="STU001",
                department="Computer Science",
                graduation_year=2026,
                phone="+1-555-0101"
            ),
            User(
                name="Jane Smith",
                email="jane@student.edu",
                student_id="STU002",
                department="Business Administration",
                graduation_year=2025,
                phone="+1-555-0102"
            )
        ]
        
        for user in sample_users:
            db.session.add(user)
    
    try:
        db.session.commit()
        print("Database initialized with sample data!")
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Use Flask's built-in server for development
    app.run(host="0.0.0.0", port=5000, debug=True)
