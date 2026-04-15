export default function Modal({ title, message, onConfirm, onCancel, confirmLabel = '삭제', danger = true }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 — 클릭으로 닫기 */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onCancel}
      />

      {/* 다이얼로그 */}
      <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-slide-up">
        <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors text-sm"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`font-semibold py-2 px-4 rounded-lg transition-colors text-sm text-white ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
