from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, expenses, summary

app = FastAPI(title="영수증 지출 관리 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(summary.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "ok", "message": "영수증 지출 관리 API가 실행 중입니다."}
