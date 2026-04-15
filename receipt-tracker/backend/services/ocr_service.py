import base64
import os
import io
from dotenv import load_dotenv
from langchain_upstage import ChatUpstage
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser

load_dotenv()

SYSTEM_PROMPT = """당신은 영수증 OCR 전문가입니다.
이미지에서 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

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


def _to_base64(file_bytes: bytes, content_type: str) -> tuple[str, str]:
    """파일 바이트를 base64 문자열로 변환. PDF는 첫 페이지를 이미지로 변환."""
    if content_type == "application/pdf":
        try:
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(file_bytes, first_page=1, last_page=1)
            buf = io.BytesIO()
            images[0].save(buf, format="JPEG")
            file_bytes = buf.getvalue()
            content_type = "image/jpeg"
        except Exception as e:
            raise ValueError(f"PDF 변환 실패: {e}")

    b64 = base64.b64encode(file_bytes).decode("utf-8")
    return b64, content_type


async def parse_receipt(file_bytes: bytes, content_type: str) -> dict:
    b64_data, media_type = _to_base64(file_bytes, content_type)

    llm = ChatUpstage(
        api_key=os.environ["UPSTAGE_API_KEY"],
        model="solar-pro2",
    )
    parser = JsonOutputParser()

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=[
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{media_type};base64,{b64_data}"},
                }
            ]
        ),
    ]

    response = await llm.ainvoke(messages)
    return parser.parse(response.content)
