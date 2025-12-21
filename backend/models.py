from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, ForeignKey, CheckConstraint
from sqlalchemy import Numeric, CheckConstraint, Enum, Index
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import time, datetime
from utils.availability import is_employee_available

metadata = MetaData()
db = SQLAlchemy(metadata=metadata)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_beautician = db.Column(db.Boolean, default=False)
    is_receptionist = db.Column(db.Boolean, default=False)
    profile_picture = db.Column(db.String(256), nullable=True, default='https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=')

    bookings = db.relationship("Booking", backref="user", lazy=True)


# Association table
employee_skills = db.Table(
    'employee_skills',
    db.Column('employee_id', db.Integer, db.ForeignKey('employees.id'), primary_key=True),
    db.Column('service_id', db.Integer, db.ForeignKey('services.id'), primary_key=True)
)


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False, unique=True)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False) 
    image = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)

    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    
    # Relationships
    bookings = db.relationship("Booking", backref="service", lazy=True)
    employees = db.relationship("Employee", secondary=employee_skills, backref="skills")
    
    def to_dict(self):
        # Handle cases where category may be None
        category_dict = {
            "id": self.category.id if self.category else None,
            "name": self.category.name if self.category else None,
        }

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": float(self.price),
            "duration_minutes": self.duration_minutes,
            "image": self.image,
            "is_active": self.is_active,
            "category": category_dict,
            "employees": [{"id": e.id, "full_name": e.full_name} for e in self.employees]
        }



class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship
    services = db.relationship(
        "Service",
        backref="category",
        lazy=True,
        cascade="all, delete-orphan"
    )



class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    _is_active = db.Column("is_active", db.Boolean, default=True)
    work_start = db.Column(db.Time, nullable=False)
    work_end = db.Column(db.Time, nullable=False)
    work_days = db.Column(db.String(20), nullable=False)  # e.g., "0,1,2,3,4"
    override_active = db.Column(db.Boolean, nullable=True)
    other_skills = db.Column(db.Text, nullable=True)
    employee_profile_picture = db.Column(db.String(256), nullable=True, default='https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=')

    bookings = db.relationship("Booking", backref="employee", lazy=True)

    def is_available(self, booking_date, start_time, end_time, service=None):
        return is_employee_available(
            employee=self,
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_time,
            service=service
    )
   
    @hybrid_property
    def is_active(self):
        """Return True/False based on time or admin override."""
        if self.override_active is not None:
            return self.override_active
        return self._is_active

    @is_active.setter
    def is_active(self, value):
        """Setter updates persisted state."""
        self._is_active = value
    

    __table_args__ = (
        Index('idx_employee_active', 'is_active', 'override_active'),
    )



class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    status = db.Column(db.Enum("pending","confirmed","in_progress","completed","cancelled",name="booking_status"),
    default="confirmed")


    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('start_time < end_time', name='check_start_before_end'),
        Index('idx_employee_date_status', 'employee_id', 'booking_date', 'status'),
        Index('idx_user_bookings', 'user_id', 'booking_date', 'status'),
    )

class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)