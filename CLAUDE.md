# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**영수증 지출 관리 앱** — 1일 스프린트 교육용 프로젝트.
영수증 이미지/PDF를 업로드하면 Upstage Vision LLM이 OCR로 구조화된 지출 데이터를 추출하고, 사용자가 대시보드에서 조회/관리하는 풀스택 웹앱.

- 참조 문서: `PRD_영수증_지출관리앱.md` (기능 요구사항), `프로그램개요서_영수증_지출관리앱.md` (아키텍처 및 구현 가이드)
- 테스트용 영수증 이미지: `images/` 디렉토리

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React v18+, Vite v5+, TailwindCSS v3+, Axios v1+ |
| 백엔드 | Python FastAPI v0.111+, LangChain v0.2+, Upstage Document AI |
| 이미지 처리 | Pillow, pdf2image |
| 저장소 | JSON 파일(`data/expenses.json`) + 브라우저 localStorage |
| 배포 | Vercel (프론트엔드 + 백엔드 Serverless Functions) |

---

## 프로젝트 구조 (구현 목표)

```
receipt-tracker/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard(/), Upload(/upload), ExpenseDetail(/expense/:id)
│   │   ├── components/     # 재사용 UI 컴포넌트
│   │   └── api/            # Axios 클라이언트 (VITE_API_BASE_URL 기반)
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py             # FastAPI 앱 진입점
│   ├── routers/            # API 라우터
│   ├── services/           # LangChain + Upstage OCR 로직
│   ├── data/
│   │   └── expenses.json   # 지출 데이터 저장
│   └── requirements.txt
├── vercel.json             # Vercel 배포 설정
└── .env                    # API 키 (절대 커밋 금지)
```

---

## 개발 명령어

### 프론트엔드
```bash
cd frontend
npm install
npm run dev       # 개발 서버 (localhost:5173)
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 로컬 미리보기
```

### 백엔드
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # 개발 서버 (localhost:8000)
```

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/upload` | 영수증 이미지 업로드 및 OCR 파싱 |
| GET | `/api/expenses` | 지출 목록 조회 (쿼리: `start_date`, `end_date`) |
| GET | `/api/expenses/{id}` | 단건 지출 상세 조회 |
| PUT | `/api/expenses/{id}` | 지출 정보 수정 |
| DELETE | `/api/expenses/{id}` | 지출 삭제 |
| GET | `/api/summary` | 지출 통계/합계 |

---

## 데이터 스키마 (expenses.json 레코드)

```json
{
  "id": "UUID v4",
  "created_at": "ISO 8601",
  "store_name": "가맹점명",
  "receipt_date": "YYYY-MM-DD",
  "receipt_time": "HH:MM",
  "category": "식비 | 교통 | 쇼핑 | 의료 | 기타",
  "items": [{"name": "", "quantity": 1, "unit_price": 0, "total_price": 0}],
  "subtotal": 0,
  "discount": 0,
  "tax": 0,
  "total_amount": 0,
  "payment_method": "신용카드 | 현금 | ...",
  "raw_image_path": "업로드 경로"
}
```

---

## Upstage OCR 연동 패턴

LangChain을 통해 Upstage Document AI를 호출하고 JSON 구조화 응답을 추출한다.

```python
from langchain_upstage import ChatUpstage
from langchain_core.messages import HumanMessage

llm = ChatUpstage(api_key=UPSTAGE_API_KEY, model="solar-pro")
# 이미지를 base64로 인코딩 후 vision 메시지로 전달
# 프롬프트: 영수증 필드를 JSON 스키마 형식으로 추출하도록 지시
```

- OCR 응답 제한: 10초 이내
- 지원 형식: JPG, PNG, PDF (최대 10MB)
- 지원 언어: 한국어, 영어 영수증

---

## 환경 변수

`.env` 파일 (로컬) 및 Vercel 환경 변수에 설정:

| 변수명 | 용도 |
|--------|------|
| `UPSTAGE_API_KEY` | Upstage Vision LLM 인증 |
| `VITE_API_BASE_URL` | 프론트엔드 → 백엔드 API 기본 URL |

---

## 아키텍처 제약 (1일 스프린트 MVP)

- **DB 없음**: 서버는 `expenses.json` 파일, 클라이언트는 `localStorage` 사용
- **단일 사용자**: 인증/다중 사용자 없음
- **Vercel Serverless 한계**: 파일 시스템이 요청 간 지속되지 않으므로, 실제 배포 시 `expenses.json` 대신 외부 저장소(KV, DB) 필요
- **Must-Have만 구현**: 카테고리 자동학습, 모바일 앱은 Phase 2

---

## UI 디자인 시스템

**색상**:
- Primary: `#4F46E5` (Indigo)
- Success: `#22C55E` (Green)
- Error: `#EF4444` (Red)

**반응형 그리드**:
- Mobile `< 640px`: 1열
- Tablet `≥ 640px`: 2열
- Desktop `≥ 1024px`: 3열, 최대 너비 896px

**폰트**: Pretendard → Noto Sans KR → system-ui 순서 fallback
