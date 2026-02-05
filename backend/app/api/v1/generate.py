"""AI document generation routes."""
import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import UserEx
from app.models.company import CompanyEx
from app.models.rd_notice import RDNoticeEx
from app.schemas.document import GenerateRequest, GenerateResponse

router = APIRouter()


class RDProposalRequest(BaseModel):
    """Request for generating R&D proposal."""
    rd_notice_id: int


@router.post("/rd-proposal", response_model=GenerateResponse)
def generate_rd_proposal(
    req: RDProposalRequest, 
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI proposal content based on R&D notice and company data."""
    # Get company data
    company = db.query(CompanyEx).filter(CompanyEx.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get R&D notice
    rd_notice = db.query(RDNoticeEx).filter(RDNoticeEx.id == req.rd_notice_id).first()
    if not rd_notice:
        raise HTTPException(status_code=404, detail="R&D notice not found")
    
    # Simulate AI processing
    time.sleep(2)
    
    # Extract company info
    company_name = company.name
    sector = company.sector
    founded_year = company.founded_date.split('-')[0] if company.founded_date else "2020"
    revenue = company.financials[0].revenue if company.financials else 0
    debt_ratio = company.financials[0].debt_ratio if company.financials else 0
    patents_count = 0  # In production, this would query a patents table
    projects_count = len(company.projects) if company.projects else 0
    
    # Extract R&D notice info
    notice_title = rd_notice.title
    notice_dept = rd_notice.department
    notice_sector = rd_notice.sector
    grant_amount = rd_notice.grant_amount
    
    # AI-generated proposal (Mock - 실제로는 OpenAI API 호출)
    generated_content = f"""# R&D 제안서: {notice_title}

## 📋 과제 정보
- **공고명**: {notice_title}
- **주관부처**: {notice_dept}
- **지원분야**: {notice_sector}
- **지원금액**: 최대 {grant_amount}백만원

---

## 1. 사업 개요

### 1.1 제안 배경
**{company_name}**는 {founded_year}년 설립 이래 **{sector}** 분야에서 혁신적인 기술 개발과 사업화를 추진해온 중소기업입니다. 

최근 매출 **{revenue}억원**, 부채비율 **{debt_ratio}%**로 안정적인 재무 구조를 유지하며, **특허 {patents_count}건**, **정부과제 수행 {projects_count}건**의 우수한 기술력을 보유하고 있습니다.

본 제안서는 {notice_dept}의 **{notice_title}** 공고에 대응하여, 당사의 핵심 기술을 기반으로 **{notice_sector}** 분야의 혁신적 솔루션 개발을 목표로 하고 있습니다.

### 1.2 추진 필요성
{notice_sector} 시장은 최근 급격한 기술 변화와 글로벌 경쟁 심화로 인해 다음과 같은 과제에 직면해 있습니다:

- **기술 격차 해소**: 선진국 대비 기술 수준 격차 축소 필요
- **국산화 대체**: 수입 의존도 감소 및 자체 기술 확보
- **시장 경쟁력 강화**: 글로벌 시장 진출을 위한 차별화 기술 개발

---

## 2. 연구개발 목표 및 내용

### 2.1 최종 목표
**AI 기반 차세대 {sector} 플랫폼 개발 및 상용화**

### 2.2 세부 연구 목표

#### 1차년도 목표
- 핵심 알고리즘 설계 및 프로토타입 개발
- 빅데이터 수집 및 전처리 파이프라인 구축
- 기초 성능 검증 (목표: 기존 기술 대비 30% 성능 향상)

#### 2차년도 목표
- 시스템 통합 및 최적화
- 파일럿 테스트 (5개 이상 고객사)
- 상용화 준비 (인증, 특허 출원)

### 2.3 핵심 기술 개발 내용

당사가 보유한 **{patents_count}건의 특허 기술**을 기반으로 다음 기술을 개발합니다:

1. **고성능 데이터 처리 엔진**
   - 실시간 대용량 데이터 처리 (초당 100만 건 이상)
   - 분산 병렬 처리 아키텍처 설계

2. **AI 기반 예측 모델**
   - 딥러닝 알고리즘 적용 (정확도 95% 이상)
   - 자동 학습 및 모델 최적화 시스템

3. **사용자 인터페이스 혁신**
   - 직관적 대시보드 및 시각화
   - 모바일 최적화 (iOS/Android 지원)

---

## 3. 연구개발 추진 체계

### 3.1 연구팀 구성
- **총괄책임자**: CTO (박사, {sector} 분야 15년 경력)
- **핵심 연구원**: 석박사급 5명 (AI, 빅데이터, 시스템 아키텍처)
- **개발팀**: 경력 3년 이상 개발자 8명

### 3.2 보유 인프라
- 고성능 서버 클러스터 (GPU 16대)
- 클라우드 컴퓨팅 환경 (AWS/GCP)
- 테스트 베드 및 개발 도구

---

## 4. 연구개발 일정 및 추진 전략

### 4.1 연구개발 일정
| 단계 | 기간 | 주요 내용 | 산출물 |
|------|------|----------|--------|
| 1단계 | 1-6개월 | 요구사항 분석 및 설계 | 시스템 설계서 |
| 2단계 | 7-12개월 | 프로토타입 개발 | 시제품 |
| 3단계 | 13-18개월 | 시스템 통합 및 테스트 | 베타 버전 |
| 4단계 | 19-24개월 | 상용화 준비 | 정식 제품 |

### 4.2 위험 관리
- **기술적 위험**: 정기적 기술 검토 회의 (월 1회)
- **일정 지연 위험**: 주간 진도 점검 및 마일스톤 관리
- **인력 이탈 위험**: 핵심 인력 장기 계약 및 인센티브 제도

---

## 5. 연구개발 소요 예산

### 5.1 총 소요 예산
- **총 연구비**: {grant_amount}백만원
- **정부지원금**: {grant_amount}백만원
- **기업부담금**: {int(grant_amount * 0.3)}백만원 (현금 {int(grant_amount * 0.2)}백만원, 현물 {int(grant_amount * 0.1)}백만원)

### 5.2 비목별 예산
| 비목 | 금액 (백만원) | 비율 |
|------|--------------|------|
| 인건비 | {int(grant_amount * 0.4)} | 40% |
| 재료비 | {int(grant_amount * 0.2)} | 20% |
| 연구장비 | {int(grant_amount * 0.15)} | 15% |
| 위탁연구비 | {int(grant_amount * 0.1)} | 10% |
| 연구활동비 | {int(grant_amount * 0.15)} | 15% |

---

## 6. 기대 효과 및 활용 방안

### 6.1 기술적 효과
- {sector} 분야 핵심 원천기술 확보
- 국내 최초 AI 기반 {notice_sector} 시스템 개발
- 특허 출원 3건 이상 예상

### 6.2 경제적 효과
- **매출 증대**: 개발 완료 3년 내 연 100억원 이상
- **수입 대체**: 연간 50억원 수입 절감 효과
- **고용 창출**: 신규 인력 20명 이상 채용

### 6.3 사회적 효과
- {sector} 산업 경쟁력 강화
- 중소기업 기술 혁신 선도 모델 제시
- 지역 경제 활성화 기여

---

## 7. 상용화 계획

### 7.1 시장 진출 전략
- **1단계** (개발 완료 6개월): 국내 주요 고객사 5개 파일럿 서비스
- **2단계** (개발 완료 1년): 정식 서비스 출시 및 마케팅
- **3단계** (개발 완료 2년): 글로벌 시장 진출 (아시아 → 유럽 → 미주)

### 7.2 수익 모델
- SaaS 구독 모델 (월 100만원~500만원)
- 기업용 라이선스 판매
- 컨설팅 및 기술 지원 서비스

---

## 결론

본 과제는 {company_name}의 **{patents_count}건 특허 기술**과 **{projects_count}건 정부과제 수행 경험**을 바탕으로, {notice_dept}의 **{notice_title}** 목표에 부합하는 혁신적 기술 개발을 추진합니다.

당사는 안정적인 재무구조(매출 {revenue}억원, 부채비율 {debt_ratio}%)와 우수한 연구 인력을 보유하고 있어, 본 과제의 성공적 수행이 가능합니다.

이를 통해 {sector} 분야의 기술 자립화와 시장 경쟁력 강화에 기여하고, 나아가 국가 산업 발전에 이바지하고자 합니다.
"""

    return GenerateResponse(content=generated_content)


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
