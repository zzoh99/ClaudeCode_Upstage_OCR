import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import EditForm from '../components/EditForm'
import ReceiptImage from '../components/ReceiptImage'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import api from '../api/axios'

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white shadow-sm" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-5 bg-gray-200 rounded w-20 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 h-96 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function ExpenseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [expense, setExpense]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [toast, setToast]           = useState(null)   // { message, type }

  // 마운트 시 단건 조회
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/expenses/${id}`)
        setExpense(data)
      } catch {
        // 존재하지 않는 ID → 대시보드로 복귀
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id, navigate])

  // 수정 저장 → PUT /api/expenses/{id}
  const handleSave = async (form) => {
    setSaving(true)
    try {
      const { data } = await api.put(`/api/expenses/${id}`, form)
      setExpense(data)
      setToast({ message: '수정되었습니다.', type: 'success' })
    } catch {
      setToast({ message: '수정에 실패했습니다.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // 삭제 확인 → DELETE /api/expenses/{id} → 대시보드 이동
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/expenses/${id}`)
      navigate('/')
    } catch {
      setToast({ message: '삭제에 실패했습니다.', type: 'error' })
      setShowModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            ← 목록으로
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white hover:bg-red-50 text-red-500 border border-red-200
              font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            삭제
          </button>
        </div>

        {/* 콘텐츠 — 이미지(1/3) + 편집폼(2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">원본 영수증</h2>
            <ReceiptImage imagePath={expense?.raw_image_path} />

            {/* 메타 정보 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
              <Row label="등록일" value={expense?.created_at?.slice(0, 10) ?? '-'} />
              <Row label="ID" value={expense?.id ? expense.id.slice(0, 8) + '...' : '-'} mono />
            </div>
          </div>

          <div className="lg:col-span-2">
            <EditForm data={expense} onSave={handleSave} saving={saving} />
          </div>
        </div>
      </main>

      {/* 삭제 확인 Modal */}
      {showModal && (
        <Modal
          title="지출 항목 삭제"
          message={`'${expense?.store_name || '이 항목'}'을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.`}
          confirmLabel={deleting ? '삭제 중...' : '삭제'}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
          danger
        />
      )}

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

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-700 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
