"""Data synchronization service for R&D notices."""
from sqlalchemy.orm import Session

from app.models.rd_notice import RDNoticeEx
from app.services.government_api import api_client


def sync_rd_notices(db: Session) -> int:
    """
    Synchronize R&D notices from government APIs to database.
    
    Returns:
        Number of notices added/updated
    """
    print("[INFO] Starting R&D notice synchronization...")
    
    # Fetch from government APIs
    notices_data = api_client.fetch_all_notices()
    
    # Clear existing notices (simple approach)
    # In production, you might want to update instead of replace
    db.query(RDNoticeEx).delete()
    
    # Add new notices
    new_notices = []
    for notice_data in notices_data:
        notice = RDNoticeEx(
            title=notice_data["title"],
            department=notice_data["department"],
            sector=notice_data["sector"],
            min_year=notice_data["min_year"],
            max_year=notice_data["max_year"],
            grant_amount=notice_data["grant_amount"],
            deadline=notice_data["deadline"]
        )
        new_notices.append(notice)
    
    db.add_all(new_notices)
    db.commit()
    
    count = len(new_notices)
    print(f"[INFO] Synchronized {count} R&D notices")
    
    return count


def init_rd_notices_if_empty(db: Session) -> None:
    """Initialize R&D notices if database is empty."""
    if db.query(RDNoticeEx).count() == 0:
        print("[INFO] No R&D notices found, initializing...")
        sync_rd_notices(db)
