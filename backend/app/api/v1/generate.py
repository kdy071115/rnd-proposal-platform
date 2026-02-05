"""AI document generation routes."""
import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import CompanyEx
from app.schemas.document import GenerateRequest, GenerateResponse

router = APIRouter()


@router.post("/", response_model=GenerateResponse)
def generate_proposal(req: GenerateRequest, db: Session = Depends(get_db)):
    """Generate AI proposal content based on company data."""
    db_company = db.query(CompanyEx).filter(CompanyEx.id == req.company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Simulate LLM Processing Delay
    time.sleep(1.5)

    # Construct Prompt Context
    company_name = db_company.name
    sector = db_company.sector
    revenue = 0
    if db_company.financials:
        revenue = db_company.financials[0].revenue

    # Mock LLM Output Generation
    generated_text = f"""
    <h2>1. 사업 개요</h2>
    <p>본 제안서는 <strong>{company_name}</strong>의 <strong>{sector}</strong> 분야 혁신 기술 개발을 위한 R&D 과제 계획을 기술합니다. 
    당사는 설립 이래 해당 분야에서 독보적인 기술력을 축적해왔으며, 특히 최근 매출액 {revenue}억원을 달성하며 안정적인 성장세를 보이고 있습니다.</p>
    
    <h2>2. 기술 개발의 필요성</h2>
    <p>현재 {sector} 시장은 급격한 기술 변화와 글로벌 경쟁 심화에 직면해 있습니다. 
    이에 대응하기 위해 당사가 보유한 특허 기술을 기반으로 한 차세대 솔루션 개발이 시급합니다.</p>
    
    <h3>2-1. 기존 기술의 한계</h3>
    <p>기존 솔루션은 데이터 처리 속도와 정확도 면에서 한계를 보이고 있으며, 이는 사용자 경험 저하의 주된 원인이 되고 있습니다.</p>
    
    <h2>3. 연구 개발 목표</h2>
    <ul>
        <li><strong>최종 목표:</strong> AI 기반의 고성능 {sector} 플랫폼 프로토타입 개발</li>
        <li><strong>1차년도:</strong> 핵심 알고리즘 최적화 및 빅데이터 수집 파이프라인 구축</li>
        <li><strong>2차년도:</strong> 시스템 통합 테스트 및 시범 서비스 운영</li>
    </ul>
    
    <h2>4. 기대 효과 및 상용화 계획</h2>
    <p>본 과제 성공 시 수입 의존도가 높은 {sector} 핵심 기술의 국산화를 통해 약 50억원의 수입 대체 효과가 기대됩니다. 
    또한, 개발 완료 후 1년 이내에 국내 주요 고객사를 대상으로 상용 서비스를 런칭할 계획입니다.</p>
    """

    return GenerateResponse(content=generated_text)
