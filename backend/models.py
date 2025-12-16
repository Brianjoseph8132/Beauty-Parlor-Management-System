from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, ForeignKey, CheckConstraint
from datetime import datetime
from sqlalchemy import Numeric, CheckConstraint

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


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)

    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration_minutes = db.Column(db.String, nullable=False)

    image = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)

    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    
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
            "category": category_dict
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



class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)