import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

OCR_ENDPOINT = "https://api.upstage.ai/v1/document-digitization"
CHAT_ENDPOINT = "https://api.upstage.ai/v1/chat/completions"

SYSTEM_PROMPT = """당신은 영수증 텍스트를 분석하는 전문가입니다.
OCR로 추출된 영수증 텍스트를 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "store_name": "string",
  "receipt_date": "YYYY-MM-DD",
  "receipt_time": "HH:MM or null",
  "category": "식료품|외식|교통|쇼핑|의료|기타",
  "items": [{"name": "string", "quantity": int, "unit_price": int, "total_price": int}],
  "subtotal": int,
  "discount": int,
  "tax": int,
  "total_amount": int,
  "payment_method": "string or null"
}

- 금액은 숫자만 (쉼표, 원화 기호 제외)
- 날짜가 없으면 null
- 항목이 없으면 items는 빈 배열 []
"""


async def _call_ocr_api(file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Step 1: Upstage Document OCR API 호출
    POST https://api.upstage.ai/v1/document-digitization (model: ocr)
    JPG, PNG, PDF 네이티브 지원 — base64 변환 불필요
    """
    headers = {"Authorization": f"Bearer {os.environ['UPSTAGE_API_KEY']}"}
    files = {"document": (filename, file_bytes, content_type)}
    data = {"model": "ocr"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(OCR_ENDPOINT, headers=headers, files=files, data=data)
        response.raise_for_status()

    result = response.json()
    # 최상위 "text" 필드 우선, 없으면 pages 텍스트 합산
    return result.get("text") or "\n".join(
        p.get("text", "") for p in result.get("pages", [])
    )


def _extract_json(text: str) -> dict:
    """LLM 응답에서 JSON 추출 — 마크다운 코드 블록 처리"""
    text = text.strip()
    if "```" in text:
        start = text.find("{")
        end = text.rfind("}") + 1
        text = text[start:end]
    return json.loads(text)


async def _structure_with_llm(ocr_text: str) -> dict:
    """
    Step 2: Solar Pro로 OCR 텍스트 → 구조화된 JSON 변환
    POST https://api.upstage.ai/v1/chat/completions (OpenAI 호환 엔드포인트)
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            CHAT_ENDPOINT,
            headers={
                "Authorization": f"Bearer {os.environ['UPSTAGE_API_KEY']}",
                "Content-Type": "application/json",
            },
            json={
                "model": "solar-pro",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"아래 영수증 텍스트를 JSON으로 변환하세요:\n\n{ocr_text}",
                    },
                ],
            },
        )
        response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]
    return _extract_json(content)


async def parse_receipt(file_bytes: bytes, content_type: str, filename: str = "receipt") -> dict:
    """
    영수증 파일 파싱 (2-Step Pipeline):
    1. Upstage Document OCR API  →  원시 텍스트 추출
    2. Solar Pro (chat/completions)  →  구조화된 JSON 변환
    """
    ocr_text = await _call_ocr_api(file_bytes, filename, content_type)

    if not ocr_text.strip():
        raise ValueError("OCR로 텍스트를 추출할 수 없습니다. 이미지 품질을 확인해 주세요.")

    return await _structure_with_llm(ocr_text)
