export default function ProgressBar({ visible }) {
  if (!visible) return null

  return (
    <div className="space-y-2">
      <p className="text-sm text-blue-600 font-medium text-center animate-pulse">
        OCR 분석 중...
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-2 bg-indigo-500 rounded-full animate-progress" />
      </div>
    </div>
  )
}
