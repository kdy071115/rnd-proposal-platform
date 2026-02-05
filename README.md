# R&D SaaS Platform

AI 기반 R&D 과제 제안서 자동 생성 및 맞춤형 공고 추천 플랫폼

## 프로젝트 구조

```
rnd-saas-platform/
├── frontend/          # Next.js 프론트엔드
├── backend/           # FastAPI 백엔드
└── docker-compose.yml # MySQL 데이터베이스 설정
```

## 기술 스택

### Frontend
- **Framework**: Next.js 15 (TypeScript)
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks
- **Editor**: Tiptap (Rich Text Editor)

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **ORM**: SQLAlchemy
- **Database**: MySQL 8.0
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt

## 시작하기

### 1. 데이터베이스 실행

```bash
docker-compose up -d
```

### 2. 백엔드 실행

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

백엔드 API: http://localhost:8000

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드: http://localhost:3000

## 주요 기능

- ✅ **기업 정보 관리**: 재무제표, 특허, 프로젝트 이력 관리
- ✅ **AI 문서 생성**: 기업 데이터 기반 사업계획서 자동 생성
- ✅ **맞춤형 R&D 추천**: 기업 특성에 맞는 정부 R&D 과제 매칭
- ✅ **팀 협업**: 팀원 초대 및 권한 관리
- ✅ **문서 편집기**: 리치 텍스트 에디터로 제안서 작성 및 수정

## API 문서

백엔드 서버 실행 후 다음 주소에서 API 문서 확인:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 환경 변수

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://user:password@localhost:3307/rnd_saas
SECRET_KEY=your-secret-key-here
```

## 라이선스

MIT License
