from fastapi import APIRouter
from typing import Optional
from services.storage_service import load_expenses
from collections import defaultdict
import datetime

router = APIRouter()


@router.get("/summary")
def get_summary(month: Optional[str] = None):
    """
    month 쿼리 예시: ?month=2026-04
    """
    expenses = load_expenses()

    if month:
        expenses = [e for e in expenses if e.get("receipt_date", "").startswith(month)]

    # 이번 달 기준
    this_month = datetime.date.today().strftime("%Y-%m")
    this_month_expenses = [
        e for e in load_expenses() if e.get("receipt_date", "").startswith(this_month)
    ]

    total_amount = sum(e.get("total_amount", 0) for e in expenses)
    this_month_amount = sum(e.get("total_amount", 0) for e in this_month_expenses)

    category_map: dict[str, int] = defaultdict(int)
    for e in expenses:
        cat = e.get("category") or "기타"
        category_map[cat] += e.get("total_amount", 0)

    category_summary = [
        {"category": cat, "amount": amt} for cat, amt in category_map.items()
    ]

    return {
        "total_amount": total_amount,
        "this_month_amount": this_month_amount,
        "category_summary": category_summary,
    }
