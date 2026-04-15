import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import DropZone from '../components/DropZone'
import ProgressBar from '../components/ProgressBar'
import ParsePreview from '../components/ParsePreview'
import Toast from '../components/Toast'
import api from '../api/axios'

const LS_KEY = 'expenses'

function saveToLocalStorage(expense) {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    const idx = existing.findIndex((e) => e.id === expense.id)
    if (idx >= 0) existing[idx] = expense
    else existing.push(expense)
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
  } catch {
    // localStorage 쓰기 실패는 조용히 무시
  }
}

export default function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)   // OCR 진행 중
  const [parsed, setParsed] = useState(null)       // 파싱 결과
  const [error, setError] = useState(null)         // OCR 오류 메시지
  const [saving, setSaving] = useState(false)      // 저장 진행 중
  const [toast, setToast] = useState(null)         // { message, type }

  // DropZone → POST /api/upload
  const handleFile = async (file) => {
    setError(null)
    setParsed(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setParsed(data)
    } catch (err) {
      setError(
        err.response?.data?.detail ?? 'OCR 파싱에 실패했습니다. 다시 시도해 주세요.',
      )
    } finally {
      setLoading(false)
    }
  }

  // ParsePreview 저장 버튼 → PUT /api/expenses/{id}
  const handleSave = async (form) => {
    setSaving(true)
    try {
      const { data } = await api.put(`/api/expenses/${form.id}`, form)
      saveToLocalStorage(data)
      setToast({ message: '저장되었습니다.', type: 'success' })
      setTimeout(() => navigate('/'), 1000)
    } catch {
      setToast({ message: '저장에 실패했습니다.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // 취소 → DropZone 초기 상태로 복귀
  const handleCancel = () => {
    setParsed(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">영수증 업로드</h1>

        {/* 파싱 전: DropZone 표시 */}
        {!parsed && !loading && (
          <DropZone onFile={handleFile} disabled={loading} />
        )}

        {/* OCR 처리 중: ProgressBar */}
        <ProgressBar visible={loading} />

        {/* OCR 오류 배너 */}
        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
            <span>{error}</span>
            <button
              onClick={handleCancel}
              className="ml-4 font-semibold underline hover:no-underline shrink-0"
            >
              재시도
            </button>
          </div>
        )}

        {/* 파싱 완료: ParsePreview */}
        {parsed && (
          <ParsePreview
            data={parsed}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        )}
      </main>

      {/* Toast 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
