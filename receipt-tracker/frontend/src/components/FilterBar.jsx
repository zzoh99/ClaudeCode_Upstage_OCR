import { useState } from 'react'

const inputCls =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

export default function FilterBar({ onFilter, onReset }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const handleFilter = () => onFilter({ from, to })

  const handleReset = () => {
    setFrom('')
    setTo('')
    onReset()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">시작일</label>
          <input
            type="date"
            className={inputCls}
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">종료일</label>
          <input
            type="date"
            className={inputCls}
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleFilter}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            조회
          </button>
          <button
            onClick={handleReset}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors text-sm"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  )
}
