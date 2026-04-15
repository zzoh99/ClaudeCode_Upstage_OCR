import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import SummaryCard from '../components/SummaryCard'
import FilterBar from '../components/FilterBar'
import ExpenseCard from '../components/ExpenseCard'
import api from '../api/axios'

function CardSkeleton() {
  return <div className="bg-white rounded-xl border border-gray-200 h-28 animate-pulse" />
}

export default function DashboardPage() {
  const [expenses, setExpenses]         = useState([])
  const [summary, setSummary]           = useState(null)
  const [loadingList, setLoadingList]   = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [filter, setFilter]             = useState({ from: '', to: '' })

  // GET /api/expenses (from, to 옵션)
  const fetchExpenses = useCallback(async (params = {}) => {
    setLoadingList(true)
    try {
      const { data } = await api.get('/api/expenses', { params })
      // 최신순 정렬
      setExpenses([...data].sort((a, b) =>
        (b.receipt_date ?? '').localeCompare(a.receipt_date ?? '')
      ))
    } catch (e) {
      console.error('지출 목록 조회 실패', e)
    } finally {
      setLoadingList(false)
    }
  }, [])

  // GET /api/summary (전체 기준 — 필터와 무관)
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true)
    try {
      const { data } = await api.get('/api/summary')
      setSummary(data)
    } catch (e) {
      console.error('통계 조회 실패', e)
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
    fetchSummary()
  }, [fetchExpenses, fetchSummary])

  const handleFilter = ({ from, to }) => {
    setFilter({ from, to })
    fetchExpenses({
      ...(from && { from }),
      ...(to   && { to }),
    })
  }

  const handleReset = () => {
    setFilter({ from: '', to: '' })
    fetchExpenses()
  }

  const isFiltered = !!(filter.from || filter.to)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">지출 내역</h1>

        {/* 통계 요약 */}
        <SummaryCard summary={summary} loading={loadingSummary} />

        {/* 날짜 필터 */}
        <FilterBar onFilter={handleFilter} onReset={handleReset} />

        {/* 지출 카드 목록 */}
        {loadingList ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : expenses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <span className="text-6xl mb-4">🧾</span>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {isFiltered
                ? '해당 기간에 지출 내역이 없습니다'
                : '아직 등록된 지출이 없습니다'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {isFiltered
                ? '다른 날짜 범위를 선택해 보세요'
                : '영수증을 업로드하고 지출을 기록해 보세요'}
            </p>
            {!isFiltered && (
              <Link
                to="/upload"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
              >
                + 영수증 추가
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {isFiltered
                ? `${filter.from}${filter.to ? ` ~ ${filter.to}` : ''} · 총 ${expenses.length}건`
                : `전체 ${expenses.length}건`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
