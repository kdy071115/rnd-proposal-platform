"""Initialize sample R&D data."""
from sqlalchemy.orm import Session

from app.models.rd_notice import RDNoticeEx


def init_rd_data(db: Session) -> None:
    """Initialize sample R&D notices if none exist."""
    if db.query(RDNoticeEx).count() == 0:
        samples = [
            RDNoticeEx(
                title="2024년 초기창업패키지 (SW분야)",
                department="중소벤처기업부",
                sector="IT/Software",
                min_year=0,
                max_year=3,
                grant_amount=100,
                deadline="2024-04-30"
            ),
            RDNoticeEx(
                title="AI 바우처 지원사업",
                department="과기정통부",
                sector="All",
                min_year=1,
                max_year=100,
                grant_amount=300,
                deadline="2024-05-15"
            ),
            RDNoticeEx(
                title="창업도약패키지 (도약기)",
                department="창업진흥원",
                sector="All",
                min_year=3,
                max_year=7,
                grant_amount=200,
                deadline="2024-03-31"
            ),
            RDNoticeEx(
                title="글로벌 유니콘 육성사업",
                department="중기부",
                sector="IT/Software",
                min_year=3,
                max_year=10,
                grant_amount=500,
                deadline="2024-06-01"
            ),
            RDNoticeEx(
                title="바이오 헬스케어 혁신 과제",
                department="보건복지부",
                sector="Bio/Health",
                min_year=0,
                max_year=100,
                grant_amount=400,
                deadline="2024-05-20"
            ),
        ]
        db.add_all(samples)
        db.commit()
