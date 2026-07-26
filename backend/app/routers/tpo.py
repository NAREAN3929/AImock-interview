from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.session import get_db
from app.models.models import CollegeDrive, PlacementMetric, User, Profile

router = APIRouter(prefix="/tpo", tags=["Placement TPO Portal"])

class DriveCreateRequest(BaseModel):
    company_name: str
    role_offered: str
    drive_date: str
    min_cgpa: Optional[float] = 7.0
    eligible_students_count: Optional[int] = 100

@router.get("/overview")
def get_tpo_overview(db: Session = Depends(get_db)):
    metric = db.query(PlacementMetric).first()
    if not metric:
        metric = PlacementMetric(
            batch_year="2026",
            total_enrolled=450,
            total_placed=382,
            average_readiness_score=84.2,
            highest_package_lpa=52.0,
            average_package_lpa=16.8
        )
        db.add(metric)
        db.commit()
        db.refresh(metric)

    drives = db.query(CollegeDrive).all()
    if not drives:
        default_drives = [
            CollegeDrive(company_name="Google", role_offered="Software Engineer (L3)", drive_date="2026-08-15", status="Active", min_cgpa=8.5, eligible_students_count=65),
            CollegeDrive(company_name="Amazon", role_offered="SDE-1", drive_date="2026-08-22", status="Scheduled", min_cgpa=7.5, eligible_students_count=140),
            CollegeDrive(company_name="Microsoft", role_offered="Software Engineer", drive_date="2026-09-02", status="Scheduled", min_cgpa=8.0, eligible_students_count=98),
            CollegeDrive(company_name="TCS Digital", role_offered="System Engineer", drive_date="2026-09-10", status="Scheduled", min_cgpa=6.5, eligible_students_count=320),
        ]
        db.add_all(default_drives)
        db.commit()
        drives = db.query(CollegeDrive).all()

    students_count = db.query(User).count()

    return {
        "batch_year": metric.batch_year,
        "total_enrolled": max(metric.total_enrolled, students_count),
        "total_placed": metric.total_placed,
        "placement_rate": round((metric.total_placed / max(metric.total_enrolled, 1)) * 100, 1),
        "average_readiness_score": metric.average_readiness_score,
        "highest_package_lpa": metric.highest_package_lpa,
        "average_package_lpa": metric.average_package_lpa,
        "active_drives": [
            {
                "id": d.id,
                "company_name": d.company_name,
                "role_offered": d.role_offered,
                "drive_date": d.drive_date,
                "status": d.status,
                "min_cgpa": d.min_cgpa,
                "eligible_students_count": d.eligible_students_count
            } for d in drives
        ]
    }

@router.post("/drives/create")
def create_drive(req: DriveCreateRequest, db: Session = Depends(get_db)):
    new_drive = CollegeDrive(
        company_name=req.company_name,
        role_offered=req.role_offered,
        drive_date=req.drive_date,
        min_cgpa=req.min_cgpa,
        eligible_students_count=req.eligible_students_count,
        status="Scheduled"
    )
    db.add(new_drive)
    db.commit()
    db.refresh(new_drive)
    return {
        "message": f"Placement drive for {new_drive.company_name} scheduled successfully!",
        "drive_id": new_drive.id
    }
