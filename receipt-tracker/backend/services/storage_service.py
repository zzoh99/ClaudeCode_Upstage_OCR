import json
import uuid
import datetime
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "expenses.json"


def load_expenses() -> list:
    if not DATA_FILE.exists():
        DATA_FILE.write_text("[]", encoding="utf-8")
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def save_expenses(data: list) -> None:
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def append_expense(item: dict) -> dict:
    expenses = load_expenses()
    item["id"] = str(uuid.uuid4())
    item["created_at"] = datetime.datetime.utcnow().isoformat() + "Z"
    expenses.append(item)
    save_expenses(expenses)
    return item
