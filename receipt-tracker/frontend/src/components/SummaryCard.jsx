const fmt = (n) => `${(n ?? 0).toLocaleString('ko-KR')}원`

function Skeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-28 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
      <div className="h-6 bg-gray-200 rounded w-28" />
    </div>
  )
}

export default function SummaryCard({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton /><Skeleton /><Skeleton />
      </div>
    )
  }

  const categories = summary?.category_summary ?? []

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 총 지출 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-500">총 지출</p>
        <p className="text-xl font-bold text-gray-900 mt-1">
          {fmt(summary?.total_amount)}
        </p>
        <p className="text-xs text-gray-400 mt-1">전체 기간</p>
      </div>

      {/* 이번 달 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-500">이번 달 지출</p>
        <p className="text-xl font-bold text-indigo-600 mt-1">
          {fmt(summary?.this_month_amount)}
        </p>
        <p className="text-xs text-gray-400 mt-1">이번 달 기준</p>
      </div>

      {/* 카테고리별 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">카테고리별 지출</p>
        {categories.length === 0 ? (
          <p className="text-xs text-gray-400">내역 없음</p>
        ) : (
          <div className="space-y-1.5">
            {categories.slice(0, 4).map(({ category, amount }) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-xs text-gray-600">{category}</span>
                <span className="text-xs font-semibold text-gray-900">{fmt(amount)}</span>
              </div>
            ))}
            {categories.length > 4 && (
              <p className="text-xs text-gray-400">외 {categories.length - 4}개</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
