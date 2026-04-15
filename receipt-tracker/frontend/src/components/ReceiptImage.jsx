export default function ReceiptImage({ imagePath }) {
  if (!imagePath) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">🧾</span>
        <p className="text-xs text-gray-400">원본 이미지 없음</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      <img
        src={`/api/image/${imagePath}`}
        alt="영수증 원본"
        className="w-full h-auto object-contain max-h-96"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.parentElement.querySelector('.fallback').style.display = 'flex'
        }}
      />
      <div
        className="fallback hidden flex-col items-center justify-center py-12 text-center"
      >
        <span className="text-4xl mb-3">🧾</span>
        <p className="text-xs text-gray-400">이미지를 불러올 수 없습니다</p>
      </div>
    </div>
  )
}
