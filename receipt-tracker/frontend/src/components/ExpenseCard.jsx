import { useNavigate } from 'react-router-dom'
import Badge from './Badge'

const fmt = (n) => `${(n ?? 0).toLocaleString('ko-KR')}원`

export default function ExpenseCard({ expense }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/expense/${expense.id}`)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md
        transition-shadow duration-200 p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {expense.store_name || '(상호 없음)'}
        </h3>
        <Badge category={expense.category} />
      </div>

      <p className="text-xl font-bold text-gray-900 mb-3">
        {fmt(expense.total_amount)}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{expense.receipt_date ?? '-'}</span>
        {expense.payment_method && <span>{expense.payment_method}</span>}
      </div>
    </div>
  )
}
