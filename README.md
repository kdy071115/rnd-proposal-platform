# InSight R&D - AI 기반 R&D 제안서 플랫폼

[English](#english) | [한국어](#korean)

---

<a name="korean"></a>
## 📋 프로젝트 소개

**InSight R&D**는 중소기업의 재무, 기술력, 프로젝트 이력을 AI가 분석하여 최적의 정부 R&D 과제를 자동으로 추천하는 SaaS 플랫폼입니다. 매칭된 공고에 대해 원클릭으로 제안서 초안을 생성하고, 협업 기반 문서 편집을 통해 R&D 과제 신청 과정을 혁신적으로 간소화합니다.

### ✨ 핵심 기능

- 🎯 **AI 맞춤형 R&D 추천**: 재무/기술/이력 분석으로 최적 공고 자동 매칭
- 📝 **원클릭 제안서 생성**: AI가 회사 정보 + R&D 공고 분석하여 완성도 높은 제안서 자동 작성
- 📊 **기업 분석 대시보드**: 재무 건강도, 특허, 프로젝트 이력 시각화
- 👥 **팀 협업**: 실시간 문서 편집 및 팀원 권한 관리
- 🔍 **상세 분석 페이지**: 회사 강점/약점 분석 및 개선 제안

## 🏗️ 프로젝트 구조

```
rnd-saas-platform/
├── frontend/               # Next.js 15 프론트엔드
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   └── lib/           # 유틸리티 함수
│   └── package.json
├── backend/                # FastAPI 백엔드
│   ├── app/
│   │   ├── api/v1/        # API 라우트
│   │   ├── core/          # 설정, 보안, DB
│   │   ├── models/        # SQLAlchemy 모델
│   │   ├── schemas/       # Pydantic 스키마
│   │   └── services/      # 비즈니스 로직
│   └── requirements.txt
└── docker-compose.yml      # MySQL 컨테이너
```

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (TypeScript)
- **Styling**: Tailwind CSS, shadcn/ui
- **Editor**: Tiptap (Rich Text Editor)
- **Markdown**: marked
- **State**: React Hooks
- **Notifications**: Sonner (Toast)

### Backend
- **Framework**: FastAPI (Python 3.14)
- **ORM**: SQLAlchemy
- **Database**: MySQL 8.0
- **Auth**: JWT + Argon2 hashing
- **Validation**: Pydantic

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose

### 1. 저장소 클론

```bash
git clone https://github.com/kdy071115/rnd-proposal-platform.git
cd rnd-saas-platform
```

### 2. 데이터베이스 실행

```bash
docker-compose up -d
```

### 3. 백엔드 실행

```bash
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 서버 실행
uvicorn app.main:app --reload
```

**백엔드 API**: http://localhost:8000  
**API 문서**: http://localhost:8000/docs

### 4. 프론트엔드 실행

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

**프론트엔드**: http://localhost:3000

## 📖 주요 기능 상세

### 1. 대시보드
- **적합성 점수**: 재무/기술/경험 종합 평가 (100점 만점)
- **AI 맞춤 추천**: 매칭 점수 + 이유와 함께 R&D 공고 표시
- **실시간 분석**: 사업자 번호로 회사 정보 즉시 조회

### 2. AI 제안서 생성
- **자동 분석**: R&D 공고 + 회사 데이터 분석
- **완성도 높은 초안**: 
  - 사업 개요 및 제안 배경
  - 연구개발 목표 및 내용
  - 추진 체계 및 일정
  - 예산 계획 (비목별 상세)
  - 기대 효과 및 상용화 계획
- **즉시 편집 가능**: Markdown → HTML 변환 후 리치 에디터

### 3. 문서 관리
- **Tiptap 에디터**: 리치 텍스트 편집
- **Markdown 지원**: AI 생성 마크다운 자동 렌더링
- **버전 관리**: 문서 수정 이력 추적

### 4. 팀 협업
- **팀원 초대**: 이메일로 팀원 추가
- **역할 관리**: Owner, Admin, Member 권한
- **공동 편집**: 실시간 협업 지원

## 🔐 환경 변수

### Backend (.env)
```env
# Database
DATABASE_URL=mysql+pymysql://user:password@localhost:3307/rnd_saas

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Government API (Optional)
NTIS_API_KEY=your-ntis-api-key
KSTARTUP_API_KEY=your-kstartup-api-key
```

## 📊 데이터베이스 스키마

주요 테이블:
- **users**: 사용자 계정
- **companies**: 기업 정보
- **financials**: 재무 데이터
- **projects**: 프로젝트 이력
- **documents**: 제안서 문서
- **rd_notices**: R&D 공고
- **team_members**: 팀 구성원

## 🧪 테스트

### 테스트 계정
```
Email: test1@test.com
Password: test1234
```

### 테스트 시나리오
1. 로그인
2. 대시보드에서 R&D 추천 확인
3. "Apply" 버튼 클릭 → AI 제안서 자동 생성
4. 문서 편집 및 저장
5. 팀원 초대 (Team 페이지)

## 📝 라이선스

MIT License

---

<a name="english"></a>
## 📋 Project Overview

**InSight R&D** is an AI-powered SaaS platform that automatically recommends optimal government R&D programs by analyzing SMEs' financial health, technology assets, and project history. With one-click proposal draft generation and collaborative document editing, it revolutionizes the R&D application process.

### ✨ Key Features

- 🎯 **AI-Powered R&D Matching**: Automatic matching based on financial/tech/history analysis
- 📝 **One-Click Proposal Generation**: AI analyzes company info + R&D notice to create high-quality proposals
- 📊 **Company Analysis Dashboard**: Visualize financial health, patents, and project history
- 👥 **Team Collaboration**: Real-time document editing and member permission management
- 🔍 **Detailed Analysis**: Company strengths/weaknesses analysis and improvement suggestions

## 🛠️ Tech Stack

### Frontend
- Next.js 15 (TypeScript)
- Tailwind CSS + shadcn/ui
- Tiptap Rich Text Editor
- marked (Markdown)

### Backend
- FastAPI (Python 3.14)
- SQLAlchemy + MySQL 8.0
- JWT + Argon2
- Pydantic

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/kdy071115/rnd-proposal-platform.git
cd rnd-saas-platform

# 2. Start database
docker-compose up -d

# 3. Start backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 4. Start frontend
cd frontend
npm install
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📖 Main Features

### 1. Dashboard
- **Suitability Score**: Comprehensive evaluation (100 points max)
- **AI Recommendations**: R&D notices with match scores and reasons
- **Real-time Analysis**: Instant company lookup by business ID

### 2. AI Proposal Generation
- **Auto-generated Proposals** including:
  - Executive Summary
  - R&D Objectives & Contents
  - Implementation Plan & Schedule
  - Budget Breakdown
  - Expected Outcomes & Commercialization

### 3. Document Management
- **Tiptap Editor**: Rich text editing
- **Markdown Support**: Auto-convert AI-generated markdown
- **Version Control**: Track document changes

### 4. Team Collaboration
- **Invite Members**: Add team members via email
- **Role Management**: Owner, Admin, Member permissions
- **Co-editing**: Real-time collaborative editing

## 🧪 Test Account

```
Email: test1@test.com
Password: test1234
```

## 📝 License

MIT License

---

**Built with ❤️ for Korean SMEs**
