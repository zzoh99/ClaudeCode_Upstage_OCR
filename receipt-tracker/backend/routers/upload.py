from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ocr_service import parse_receipt
from services.storage_service import append_expense

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_receipt(file: UploadFile = File(...)):
    # 파일 형식 검증
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다. JPG, PNG, PDF만 허용됩니다. (받은 형식: {file.content_type})",
        )

    file_bytes = await file.read()

    # 파일 크기 검증
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="파일 크기가 10MB를 초과합니다.",
        )

    # OCR 파싱
    try:
        parsed = await parse_receipt(file_bytes, file.content_type, file.filename or "receipt")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR 파싱 중 오류가 발생했습니다. 다시 시도해 주세요. ({e})",
        )

    # 저장
    expense = append_expense(parsed)
    return expense
