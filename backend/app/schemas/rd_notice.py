"""R&D Notice schemas."""
from pydantic import BaseModel


class RDNoticeResponse(BaseModel):
    id: int
    title: str
    department: str
    sector: str
    grant_amount: int
    deadline: str
    match_score: int = 0
    match_reason: str = ""
