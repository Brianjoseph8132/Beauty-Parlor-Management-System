from models import User,db
from flask import jsonify,request, Blueprint
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
from email_validator import validate_email, EmailNotValidError


user_bp = Blueprint("user_bp", __name__)


# Add User
@user_bp.route("/user", methods=["POST"])
def add_users():
    data = request.get_json()
    username = data.get_json('username')
    email = data.get_json('email')
    raw_password = data.get_json('password')
    is_admin = data.get_json('is_admin', False)
    is_beautician = data.get_json ('is_beautician', False)
    is_receptionist = data.get_json('is_receptionist', False)
    profile_picture = data.get('profile_picture', "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=")

    # Validation for password length before hashing it
    if not isinstance(raw_password, str) or len(raw_password) != 8:
        return jsonify({"error": "Password must be exatcly 8 characters"}), 400
    
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





    


