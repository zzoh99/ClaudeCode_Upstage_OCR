import { useRef, useState } from 'react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function DropZone({ onFile, disabled }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const validate = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('JPG, PNG, PDF 파일만 업로드할 수 있습니다.')
      return false
    }
    if (file.size > MAX_SIZE) {
      alert('파일 크기가 10MB를 초과합니다.')
      return false
    }
    return true
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file && validate(file)) onFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file && validate(file)) onFile(file)
    e.target.value = ''
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={[
        'border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200',
        disabled
          ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50'
          : isDragging
            ? 'border-indigo-500 bg-indigo-50 cursor-pointer'
            : 'border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50 cursor-pointer',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <span className="text-5xl">{isDragging ? '📂' : '📎'}</span>
        <p className="text-base font-semibold text-gray-700">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-gray-400">JPG, PNG, PDF · 최대 10MB</p>
      </div>
    </div>
  )
}
