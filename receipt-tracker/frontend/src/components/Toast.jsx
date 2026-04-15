import { useEffect } from 'react'

const STYLES = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error:   'bg-red-50 border-red-400 text-red-800',
  info:    'bg-blue-50 border-blue-400 text-blue-800',
}

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 animate-toast-in flex items-center gap-3
        px-4 py-3 rounded-lg border shadow-lg max-w-xs ${STYLES[type]}`}
    >
      <span className="font-bold text-base shrink-0">{ICONS[type]}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="ml-1 opacity-50 hover:opacity-100 transition-opacity shrink-0"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  )
}
