from models import User,db
from flask import jsonify,request, Blueprint
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
from email_validator import validate_email, EmailNotValidError


user_bp = Blueprint("user_bp", __name__)

def normalize_phone(phone):
    phone = phone.strip().replace(" ", "")

    if phone.startswith("0"):
        return "+254" + phone[1:]

    if phone.startswith("7"):
        return "+254" + phone

    if phone.startswith("+"):
        return phone

    raise ValueError("Invalid phone number")


# Add User
@user_bp.route("/user", methods=["POST"])
def add_users():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    raw_password = data.get('password')
    is_admin = data.get('is_admin', False)
    is_beautician = data.get('is_beautician', False)
    is_receptionist = data.get('is_receptionist', False)
    profile_picture = data.get('profile_picture', "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=")

    # Validation for password length before hashing it
    if not isinstance(raw_password, str) or len(raw_password) < 8:
        raise ValueError("Password must be a string of at least 8 characters")

    
    password = generate_password_hash(raw_password)

    # Email validation using email-validator
    try:
        valid_email = validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": f"Invalid email address: {str(e)}"}), 400
    
    #check if username or email already exists
    check_username = User.query.filter_by(username=username).first()
    check_email = User.query.filter_by(email=email).first()

    if check_email or check_username:
        return jsonify({"error": "Username or Email already exists"}), 400
    
    #Add new User to the database
    new_user = User(
        username=username,
        email=email,
        password=password,
        is_admin=is_admin,
        is_beautician=is_beautician,
        is_receptionist=is_beautician,
        profile_picture=profile_picture
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": " User added successfully"}), 200





    


