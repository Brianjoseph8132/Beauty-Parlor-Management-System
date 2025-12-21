from models import Booking,db, Employee, Service, User
from flask import jsonify,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.availability import is_employee_available
from utils.constants import SALON_CLOSE, SALON_OPEN, TIME_BLOCKS, BUFFER_MINUTES
from datetime import datetime, date, timedelta
from utils.slots import generate_service_slots, categorize_slot
from flask_mail import  Message
from app import mail
# from decorator import admin_required


booking_bp = Blueprint("booking_bp", __name__)

# # Configuration constants
# SALON_OPEN_TIME = time(8, 0)
# SALON_CLOSE_TIME = time(22, 0)
# BUFFER_MINUTES = 10  # Buffer time between appointments

@booking_bp.route("/bookings", methods=["POST"])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required_fields = ["service_id", "date", "start_time"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    service_id = data["service_id"]
    date_str = data["date"]
    start_str = data["start_time"]
    preferred_employee_id = data.get("employee_id")  # Optional

    # Parse and validate date/time
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        start_time = datetime.strptime(start_str, "%H:%M").time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format. Use YYYY-MM-DD and HH:MM"}), 400

    # Validate booking is not in the past
    if booking_date < datetime.today().date():
        return jsonify({"error": "Cannot book appointments in the past"}), 400
    
    if booking_date == date.today() and start_time < datetime.now().time():
        return jsonify({"error": "Cannot book appointments in the past"}), 400

    # Get service details
    service = Service.query.get_or_404(service_id)
    duration = service.duration_minutes

    # Calculate end time (service duration only, no buffer in stored time)
    start_datetime = datetime.combine(booking_date, start_time)
    end_datetime = start_datetime + timedelta(minutes=duration)
    end_time = end_datetime.time()
    
    # Calculate end time with buffer for availability checking
    end_with_buffer = (start_datetime + timedelta(minutes=duration + BUFFER_MINUTES)).time()

    # Validate booking is within salon operating hours
    if start_time < SALON_OPEN:
        return jsonify({"error": f"Salon opens at {SALON_OPEN.strftime('%H:%M')}"}), 400
    
    if end_time > SALON_CLOSE:
        return jsonify({"error": f"Salon closes at {SALON_CLOSE.strftime('%H:%M')}. This appointment would exceed closing time."}), 400

    # Helper to check employee availability
    def check_employee_availability(emp):
        """
        Check if employee is available for the requested slot + buffer time
        CRITICAL: Pass the service object, not service_id
        """
        # Call is_available with the correct parameters
        # The method signature is: is_available(self, booking_date, start_time, end_time, service=None)
        return emp.is_available(
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_with_buffer,  # Use buffer time for checking
            service=service  # Pass the service object
        )

    assigned_employee = None

    # Try to book with preferred employee first
    if preferred_employee_id:
        preferred_emp = Employee.query.get(preferred_employee_id)
        if preferred_emp and check_employee_availability(preferred_emp):
            assigned_employee = preferred_emp

    # If no preferred employee or they're unavailable, find any available employee
    if not assigned_employee:
        # Get all employees who have this service as a skill
        employees = Employee.query.filter(
            Employee.skills.any(id=service.id),
            Employee._is_active == True  # Pre-filter for active employees
        ).order_by(db.func.random()).all()  # Random distribution for fairness

        for emp in employees:
            if check_employee_availability(emp):
                assigned_employee = emp
                break

    # If no employee is available, return error
    if not assigned_employee:
        return jsonify({
            "error": "No employee available for this time slot",
            "suggestion": "Please try a different time"
        }), 409

    # Create the booking
    try:
        booking = Booking(
            user_id=user_id,
            service_id=service.id,
            employee_id=assigned_employee.id,
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_time,  # Store actual service end time, not with buffer
            price=service.price,  # CRITICAL: Set the price from service
            status="confirmed"
        )
        db.session.add(booking)
        db.session.commit()

        # Send email confirmation AFTER successful commit
        try:
            send_booking_confirmation_email(user_id, booking, service, assigned_employee)
        except Exception as e:
            # Log the error but don't fail the booking
            print(f"Failed to send confirmation email: {str(e)}")

        return jsonify({
            "message": "Booking confirmed",
            "booking_id": booking.id,
            "employee_id": assigned_employee.id,
            "employee_name": assigned_employee.full_name,
            "service_name": service.title, 
            "date": booking_date.strftime("%Y-%m-%d"),
            "start_time": start_time.strftime("%H:%M"),
            "end_time": end_time.strftime("%H:%M"),
            "duration_minutes": duration,
            "price": float(service.price)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create booking: {str(e)}"}), 500


def send_booking_confirmation_email(user_id, booking, service, employee):
    """Send booking confirmation email to user"""
    try:
        user = User.query.get(user_id)
        if not user or not user.email:
            print(f"No email found for user {user_id}")
            return

        msg = Message(
            subject="Booking Confirmation - Your Appointment",
            recipients=[user.email],
            body=f"""
Hello {user.username or 'there'},

Your booking has been confirmed!

Service: {service.title}
Date: {booking.booking_date.strftime('%A, %B %d, %Y')}
Time: {booking.start_time.strftime('%I:%M %p')} - {booking.end_time.strftime('%I:%M %p')}
Duration: {service.duration_minutes} minutes
Employee: {employee.full_name}
Price: ${booking.price}

Please arrive 5-10 minutes before your appointment time.

If you need to cancel or reschedule, please contact us at least 24 hours in advance.

Thank you for booking with us!
We look forward to seeing you.

Best regards,
Your Salon Team
            """.strip()
        )
        mail.send(msg)
        print(f"Confirmation email sent to {user.email}")
        
    except Exception as e:
        # Log but don't raise - email failure shouldn't fail the booking
        print(f"Error sending confirmation email: {str(e)}")


@booking_bp.route("/bookings", methods=["GET"])
@jwt_required()
def get_user_bookings():
    """Get all bookings for the current user"""
    user_id = get_jwt_identity()
    status_filter = request.args.get("status")  # Optional: filter by status
    
    query = Booking.query.filter_by(user_id=user_id)
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    bookings = query.order_by(Booking.booking_date.desc(), Booking.start_time.desc()).all()
    
    return jsonify([{
        "id": b.id,
        "service_name": b.service.title,  # Changed from .name to .title
        "employee_name": b.employee.full_name,
        "date": b.booking_date.strftime("%Y-%m-%d"),
        "start_time": b.start_time.strftime("%H:%M"),
        "end_time": b.end_time.strftime("%H:%M"),
        "status": b.status,
        "price": float(b.price)
    } for b in bookings]), 200







# @booking_bp.route("/api/bookings/<int:booking_id>/reschedule", methods=["PATCH"])
# @jwt_required()
# def reschedule_booking(booking_id):
#     user_id = get_jwt_identity()
#     data = request.get_json()

#     booking = Booking.query.get_or_404(booking_id)

#     if booking.user_id != user_id:
#         return jsonify({"error": "Unauthorized"}), 403

#     if booking.status != "confirmed":
#         return jsonify({"error": "Only confirmed bookings can be rescheduled"}), 400

#     date_str = data.get("date")
#     start_str = data.get("start_time")
#     employee_id = data.get("employee_id")

#     booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
#     start_time = datetime.strptime(start_str, "%H:%M").time()

#     duration = booking.end_time.hour * 60 + booking.end_time.minute - (
#         booking.start_time.hour * 60 + booking.start_time.minute
#     )

#     start_minutes = start_time.hour * 60 + start_time.minute
#     end_time = (datetime.min + timedelta(minutes=start_minutes + duration)).time()

#     # Auto-assign employee if needed
#     if not employee_id:
#         employee = find_available_employee(
#             booking.service_id,
#             booking.location_id,
#             booking_date,
#             start_time,
#             end_time
#         )

#         if not employee:
#             return jsonify({"error": "No available employee"}), 409

#         employee_id = employee.id

#     # Overlap check
#     overlap = Booking.query.filter(
#         Booking.employee_id == employee_id,
#         Booking.booking_date == booking_date,
#         Booking.start_time < end_time,
#         Booking.end_time > start_time,
#         Booking.id != booking.id
#     ).first()

#     if overlap:
#         return jsonify({"error": "Time slot already booked"}), 409

#     booking.booking_date = booking_date
#     booking.start_time = start_time
#     booking.end_time = end_time
#     booking.employee_id = employee_id

#     db.session.commit()

#     return jsonify({"message": "Booking rescheduled"})





# @booking_bp.route("/api/bookings/<int:booking_id>/cancel", methods=["PATCH"])
# @jwt_required()
# def cancel_booking(booking_id):
#     user_id = get_jwt_identity()
#     booking = Booking.query.get_or_404(booking_id)

#     if booking.user_id != user_id:
#         return jsonify({"error": "Unauthorized"}), 403

#     if booking.status == "completed":
#         return jsonify({"error": "Completed booking cannot be cancelled"}), 400

#     booking.status = "cancelled"
#     db.session.commit()

#     return jsonify({"message": "Booking cancelled"})




@booking_bp.route("/available-slots", methods=["GET"])
@jwt_required()
def available_slots():
    """
    Get available time slots for a specific service and date.
    
    Query Parameters:
        - service_id: ID of the service
        - date: Booking date in YYYY-MM-DD format
    
    Returns:
        JSON with slots categorized by time of day (morning/afternoon/evening)
    """
    service_id = request.args.get("service_id")
    date_str = request.args.get("date")

    # Validate required parameters
    if not service_id or not date_str:
        return jsonify({"error": "service_id and date are required"}), 400

    # Get service
    service = Service.query.get_or_404(service_id)
    
    # Validate and parse date
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Don't allow booking in the past
    if booking_date < date.today():
        return jsonify({"error": "Cannot check slots for past dates"}), 400

    # Generate all possible slots based on service duration
    all_slots = generate_service_slots(service.duration_minutes)

    # Get employees who can perform this service
    employees = Employee.query.filter(
        Employee.skills.any(id=service.id),
        Employee._is_active == True  # Pre-filter for active employees
    ).all()

    if not employees:
        return jsonify({
            "error": "No employees available for this service",
            "slots": {"morning": [], "afternoon": [], "evening": []}
        }), 404

    # Organize available slots by time period
    available_slots = {
        "morning": [],
        "afternoon": [],
        "evening": []
    }

    # Check each slot for availability
    for start_time, end_time in all_slots:
        # Calculate end time with buffer for availability checking
        start_datetime = datetime.combine(date.today(), start_time)
        end_with_buffer = (start_datetime + timedelta(
            minutes=service.duration_minutes + BUFFER_MINUTES
        )).time()

        # Check if ANY employee is available for this slot
        slot_available = False
        available_employee = None
        
        for emp in employees:
            # CRITICAL: Pass the service object to is_available
            if emp.is_available(
                booking_date=booking_date,
                start_time=start_time,
                end_time=end_with_buffer,  # Use buffer time for checking
                service=service  # Pass service object, not ID
            ):
                slot_available = True
                available_employee = emp
                break  # One available employee is enough

        # If slot is available, add it to the appropriate time period
        if slot_available:
            period = categorize_slot(start_time)
            available_slots[period].append({
                "start_time": start_time.strftime("%H:%M"),
                "end_time": end_time.strftime("%H:%M"),  # Return actual service end, not with buffer
                "employee_id": available_employee.id,
                "employee_name": available_employee.full_name
            })

    # Return response with metadata
    return jsonify({
        "date": date_str,
        "service_id": service_id,
        "service_title": service.title,
        "duration_minutes": service.duration_minutes,
        "price": float(service.price),
        "slots": available_slots,
        "total_available": (
            len(available_slots["morning"]) +
            len(available_slots["afternoon"]) +
            len(available_slots["evening"])
        )
    }), 200









# @booking_bp.route("/api/bookings/<int:id>/complete", methods=["PATCH"])
# @jwt_required()
# def complete_service(id):
#     booking = Booking.query.get_or_404(id)

#     if booking.status != "in_progress":
#         return jsonify({"error": "Booking not in progress"}), 400

#     booking.status = "completed"
#     booking.completed_by = booking.employee.full_name
#     booking.completed_at = datetime.utcnow()

#     db.session.commit()

#     return jsonify({"message": "Service completed"})







# @booking_bp.route("/api/bookings/<int:id>/start", methods=["PATCH"])
# @jwt_required()
# def start_service(id):
#     booking = Booking.query.get_or_404(id)

#     if booking.status != "confirmed":
#         return jsonify({"error": "Cannot start booking"}), 400

#     booking.status = "in_progress"
#     db.session.commit()

#     return jsonify({"message": "Service started"})
