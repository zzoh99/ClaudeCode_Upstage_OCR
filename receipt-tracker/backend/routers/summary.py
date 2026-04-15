from fastapi import APIRouter
from typing import Optional
from services.storage_service import load_expenses
from collections import defaultdict
import datetime

router = APIRouter()


@router.get("/summary")
def get_summary(month: Optional[str] = None):
    """
    지출 합계 통계 조회.
    - month 미지정: 전체 합계
    - ?month=YYYY-MM: 해당 월 합계
    - this_month_amount는 항상 오늘 기준 이번 달 합계
    """
    all_expenses = load_expenses()

    # 이번 달 합계 (month 파라미터와 무관하게 항상 오늘 기준)
    this_month = datetime.date.today().strftime("%Y-%m")
    this_month_amount = sum(
        e.get("total_amount", 0)
        for e in all_expenses
        if e.get("receipt_date", "").startswith(this_month)
    )

    # month 파라미터로 필터링
    expenses = (
        [e for e in all_expenses if e.get("receipt_date", "").startswith(month)]
        if month
        else all_expenses
    )

    total_amount = sum(e.get("total_amount", 0) for e in expenses)

    category_map: dict[str, int] = defaultdict(int)
    for e in expenses:
        cat = e.get("category") or "기타"
        category_map[cat] += e.get("total_amount", 0)

    return {
        "total_amount": total_amount,
        "this_month_amount": this_month_amount,
        "category_summary": [
            {"category": cat, "amount": amt} for cat, amt in category_map.items()
        ],
    }
