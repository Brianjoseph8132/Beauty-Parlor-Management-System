from models import db, Employee, Service, User
from flask import jsonify,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.constants import DAY_MAP, DAY_NAME_TO_NUM
from datetime import time, datetime
from decorator import admin_required


attendance_bp = Blueprint("attendance_bp", __name__)