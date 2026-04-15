from fastapi import APIRouter, HTTPException
from typing import Optional
from services.storage_service import load_expenses, save_expenses

router = APIRouter()


@router.get("/expenses")
def get_expenses(start: Optional[str] = None, end: Optional[str] = None):
    expenses = load_expenses()
    if start:
        expenses = [e for e in expenses if e.get("receipt_date", "") >= start]
    if end:
        expenses = [e for e in expenses if e.get("receipt_date", "") <= end]
    return expenses


@router.put("/expenses/{expense_id}")
def update_expense(expense_id: str, body: dict):
    expenses = load_expenses()
    for i, e in enumerate(expenses):
        if e["id"] == expense_id:
            expenses[i] = {**e, **body, "id": expense_id}
            save_expenses(expenses)
            return expenses[i]
    raise HTTPException(status_code=404, detail="지출 항목을 찾을 수 없습니다.")


@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str):
    expenses = load_expenses()
    filtered = [e for e in expenses if e["id"] != expense_id]
    if len(filtered) == len(expenses):
        raise HTTPException(status_code=404, detail="지출 항목을 찾을 수 없습니다.")
    save_expenses(filtered)
    return {"message": "삭제되었습니다."}
