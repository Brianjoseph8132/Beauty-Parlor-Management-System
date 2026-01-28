from models import db, Employee, Attendance
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required
from utils.constants import SALON_OPEN, GRACE_PERIOD_END
from datetime import datetime, date
from decorator import receptionist_required, admin_required
from datetime import timedelta
import calendar
from sqlalchemy import func, case

attendance_bp = Blueprint("attendance_bp", __name__)


def is_employee_working_today(employee, target_date=None):
    target_date = target_date or date.today()
    return str(target_date.weekday()) in employee.work_days.split(",")


def calculate_worked_hours(check_in, check_out):
    if not check_in or not check_out:
        return 0.0

    if check_out < check_in:
        return 0.0

    duration = check_out - check_in
    hours = duration.total_seconds() / 3600
    return round(hours, 2)


@attendance_bp.route("/attendance/check-in/<int:employee_id>", methods=["POST"])
@jwt_required()
@receptionist_required
def check_in(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    if not employee.is_active:
        return jsonify({
            "error": "Employee is currently inactive"
        }), 400

    today = date.today()

    # Not scheduled to work
    if not is_employee_working_today(employee, today):
        return jsonify({
            "error": "Employee is not scheduled to work today"
        }), 400

    now = datetime.utcnow()

    # Salon closed
    if now.time() < SALON_OPEN:
        return jsonify({
            "error": "Salon opens at 8:00 AM"
        }), 400

    attendance = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()

    if attendance and attendance.check_in:
        return jsonify({"error": "Employee already checked in"}), 400

    if not attendance:
        attendance = Attendance(
            employee_id=employee_id,
            date=today
        )
        db.session.add(attendance)

    attendance.check_in = now

    # Grace period logic (FINAL)
    attendance.status = (
        "Present"
        if now.time() <= GRACE_PERIOD_END
        else "Late"
    )

    db.session.commit()

    return jsonify({
        "message": "Check-in successful",
        "employee": employee.full_name,
        "check_in": attendance.check_in.isoformat(),
        "status": attendance.status
    }), 200




@attendance_bp.route("/attendance/check-out/<int:employee_id>", methods=["POST"])
@jwt_required()
@receptionist_required
def check_out(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    if not employee.is_active:
        return jsonify({"error": "Employee is currently inactive"}), 400

    today = date.today()

    if not is_employee_working_today(employee, today):
        return jsonify({"error": "Employee is not scheduled to work today"}), 400

    attendance = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()

    if not attendance or not attendance.check_in:
        return jsonify({"error": "Employee has not checked in"}), 400

    if attendance.check_out:
        return jsonify({"error": "Employee already checked out"}), 400

    now = datetime.utcnow()

    # Auto-close at salon closing time
    if now.time() > SALON_CLOSE:
        now = datetime.combine(today, SALON_CLOSE)

    attendance.check_out = now
    attendance.worked_hours = calculate_worked_hours(
        attendance.check_in,
        attendance.check_out
    )

    db.session.commit()

    return jsonify({
        "message": "Check-out successful",
        "check_out": attendance.check_out.isoformat(),
        "worked_hours": attendance.worked_hours
    }), 200



@attendance_bp.route("/attendance/absent/<int:employee_id>", methods=["POST"])
@jwt_required()
@receptionist_required
def mark_absent(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    if not employee.is_active:
        return jsonify({
            "error": "Employee is currently inactive"
        }), 400

    today = date.today()

    if not is_employee_working_today(employee, today):
        return jsonify({
            "error": "Employee is not scheduled to work today"
        }), 400

    now = datetime.utcnow().time()
    if now < SALON_CLOSE:
        return jsonify({
            "error": "Employee can only be marked absent after salon closing time"
        }), 400

    attendance = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()

    if attendance:
        if attendance.check_in:
            return jsonify({
                "error": "Employee already checked in, cannot mark absent"
            }), 400
        return jsonify({"error": "Attendance already exists"}), 400

    attendance = Attendance(
        employee_id=employee_id,
        date=today,
        status="Absent"
    )

    db.session.add(attendance)
    db.session.commit()

    return jsonify({"message": "Employee marked absent"}), 200





@attendance_bp.route("/attendance/report/monthly/<int:employee_id>", methods=["GET"])
@jwt_required()
@admin_required
def monthly_attendance_report(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    month_str = request.args.get("month")
    if not month_str:
        return jsonify({"error": "month is required (YYYY-MM)"}), 400

    year, month = map(int, month_str.split("-"))
    start_date = date(year, month, 1)
    end_date = date(year, month, calendar.monthrange(year, month)[1])

    records = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(start_date, end_date)
    ).all()

    total_hours = sum(
        calculate_worked_hours(a.check_in, a.check_out)
        for a in records
    )

    summary = db.session.query(
        func.count(Attendance.id).label("total_days"),
        func.sum(case((Attendance.status == "Present", 1), else_=0)).label("present"),
        func.sum(case((Attendance.status == "Late", 1), else_=0)).label("late"),
        func.sum(case((Attendance.status == "Absent", 1), else_=0)).label("absent")
    ).filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(start_date, end_date)
    ).first()

    return jsonify({
        "employee_id": employee.id,
        "employee_name": employee.full_name,
        "period": "monthly",
        "month": month_str,
        "summary": {
            "total_days": summary.total_days or 0,
            "present": summary.present or 0,
            "late": summary.late or 0,
            "absent": summary.absent or 0,
            "total_worked_hours": total_hours
        }
    }), 200




@attendance_bp.route("/attendance/report/weekly/<int:employee_id>", methods=["GET"])
@jwt_required()
@admin_required
def weekly_attendance_report(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    week_start_str = request.args.get("week_start")
    if not week_start_str:
        return jsonify({"error": "week_start is required (YYYY-MM-DD)"}), 400

    week_start = datetime.strptime(week_start_str, "%Y-%m-%d").date()
    week_end = week_start + timedelta(days=6)

    records = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(week_start, week_end)
    ).all()

    total_hours = sum(
        calculate_worked_hours(a.check_in, a.check_out)
        for a in records
    )

    summary = db.session.query(
        func.count(Attendance.id).label("total_days"),
        func.sum(case((Attendance.status == "Present", 1), else_=0)).label("present"),
        func.sum(case((Attendance.status == "Late", 1), else_=0)).label("late"),
        func.sum(case((Attendance.status == "Absent", 1), else_=0)).label("absent")
    ).filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(week_start, week_end)
    ).first()

    return jsonify({
        "employee_id": employee.id,
        "employee_name": employee.full_name,
        "period": "weekly",
        "from": week_start.isoformat(),
        "to": week_end.isoformat(),
        "summary": {
            "total_days": summary.total_days or 0,
            "present": summary.present or 0,
            "late": summary.late or 0,
            "absent": summary.absent or 0,
            "total_worked_hours": total_hours
        }
    }), 200




@attendance_bp.route("/attendance", methods=["GET"])
@jwt_required()
def get_attendance_records():
    user = User.query.get(get_jwt_identity())

    # Check if user is admin OR receptionist
    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403
        
    # Optional filters
    employee_id = request.args.get("employee_id", type=int)
    from_date_str = request.args.get("from_date")
    to_date_str = request.args.get("to_date")

    # Parse dates
    try:
        from_date = datetime.strptime(from_date_str, "%Y-%m-%d").date() if from_date_str else date.today()
        to_date = datetime.strptime(to_date_str, "%Y-%m-%d").date() if to_date_str else date.today()
    except ValueError:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    # Base query
    query = Attendance.query.join(Employee)

    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    query = query.filter(Attendance.date.between(from_date, to_date)).order_by(Attendance.date.asc())

    records = query.all()

    data = []
    for rec in records:
        data.append({
            "employee_id": rec.employee_id,
            "employee_name": rec.employee.full_name,
            "date": rec.date.isoformat(),
            "check_in": rec.check_in.isoformat() if rec.check_in else None,
            "check_out": rec.check_out.isoformat() if rec.check_out else None,
            "status": rec.status,
            "worked_hours": rec.worked_hours or 0
        })

    return jsonify({
        "from_date": from_date.isoformat(),
        "to_date": to_date.isoformat(),
        "total_records": len(data),
        "attendance": data
    }), 200
