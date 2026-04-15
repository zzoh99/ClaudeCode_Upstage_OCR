from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.storage_service import load_expenses, save_expenses

router = APIRouter()


@router.get("/expenses")
def get_expenses(
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
):
    """지출 목록 조회. ?from=YYYY-MM-DD&to=YYYY-MM-DD 날짜 필터 지원."""
    expenses = load_expenses()
    if from_date:
        expenses = [e for e in expenses if e.get("receipt_date", "") >= from_date]
    if to_date:
        expenses = [e for e in expenses if e.get("receipt_date", "") <= to_date]
    return expenses


@router.get("/expenses/{expense_id}")
def get_expense(expense_id: str):
    """단건 지출 상세 조회."""
    expenses = load_expenses()
    for e in expenses:
        if e["id"] == expense_id:
            return e
    raise HTTPException(status_code=404, detail="지출 항목을 찾을 수 없습니다.")


@router.put("/expenses/{expense_id}")
def update_expense(expense_id: str, body: dict):
    """지출 항목 수정. id·created_at은 변경 불가."""
    expenses = load_expenses()
    for i, e in enumerate(expenses):
        if e["id"] == expense_id:
            body.pop("id", None)
            body.pop("created_at", None)
            expenses[i] = {**e, **body}
            save_expenses(expenses)
            return expenses[i]
    raise HTTPException(status_code=404, detail="지출 항목을 찾을 수 없습니다.")


@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str):
    """지출 항목 삭제."""
    expenses = load_expenses()
    filtered = [e for e in expenses if e["id"] != expense_id]
    if len(filtered) == len(expenses):
        raise HTTPException(status_code=404, detail="지출 항목을 찾을 수 없습니다.")
    save_expenses(filtered)
    return {"message": "삭제되었습니다."}
