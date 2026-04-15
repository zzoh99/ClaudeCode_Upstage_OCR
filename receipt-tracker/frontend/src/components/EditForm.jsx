import { useState } from 'react'
import Badge from './Badge'

const CATEGORIES = ['식료품', '외식', '교통', '쇼핑', '의료', '기타']

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

function Field({ label, required, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function EditForm({ data, onSave, saving }) {
  const [form, setForm] = useState(data)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const setItem = (idx, field, value) => {
    const items = [...(form.items ?? [])]
    items[idx] = { ...items[idx], [field]: value }
    setForm((prev) => ({ ...prev, items }))
  }

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [...(prev.items ?? []), { name: '', quantity: 1, unit_price: 0, total_price: 0 }],
    }))

  const removeItem = (idx) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))

  const handleReset = () => setForm(data)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">지출 내역 수정</h2>
        <Badge category={form.category} />
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="가게명" required>
          <input
            className={inputCls}
            value={form.store_name ?? ''}
            onChange={(e) => set('store_name', e.target.value)}
            placeholder="가게 이름"
          />
        </Field>
        <Field label="카테고리">
          <select
            className={inputCls}
            value={form.category ?? '기타'}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="날짜">
          <input
            type="date"
            className={inputCls}
            value={form.receipt_date ?? ''}
            onChange={(e) => set('receipt_date', e.target.value)}
          />
        </Field>
        <Field label="시간">
          <input
            type="time"
            className={inputCls}
            value={form.receipt_time ?? ''}
            onChange={(e) => set('receipt_time', e.target.value || null)}
          />
        </Field>
        <Field label="결제 수단">
          <input
            className={inputCls}
            value={form.payment_method ?? ''}
            onChange={(e) => set('payment_method', e.target.value)}
            placeholder="신용카드, 현금 등"
          />
        </Field>
      </div>

      {/* 품목 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">품목 목록</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + 항목 추가
          </button>
        </div>
        <div className="space-y-2">
          {(form.items ?? []).length > 0 && (
            <div className="hidden sm:grid sm:grid-cols-[1fr_56px_88px_88px_24px] gap-2 px-1">
              {['품목명', '수량', '단가', '합계', ''].map((h) => (
                <span key={h} className="text-xs text-gray-400">{h}</span>
              ))}
            </div>
          )}
          {(form.items ?? []).map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_56px_88px_88px_24px] gap-2 items-center">
              <input className={inputCls} placeholder="품목명" value={item.name}
                onChange={(e) => setItem(idx, 'name', e.target.value)} />
              <input type="number" className={inputCls} min={1} value={item.quantity}
                onChange={(e) => setItem(idx, 'quantity', Number(e.target.value))} />
              <input type="number" className={inputCls} value={item.unit_price}
                onChange={(e) => setItem(idx, 'unit_price', Number(e.target.value))} />
              <input type="number" className={inputCls} value={item.total_price}
                onChange={(e) => setItem(idx, 'total_price', Number(e.target.value))} />
              <button type="button" onClick={() => removeItem(idx)}
                className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* 금액 합계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="소계">
          <input type="number" className={inputCls} value={form.subtotal ?? 0}
            onChange={(e) => set('subtotal', Number(e.target.value))} />
        </Field>
        <Field label="할인">
          <input type="number" className={inputCls} value={form.discount ?? 0}
            onChange={(e) => set('discount', Number(e.target.value))} />
        </Field>
        <Field label="세금">
          <input type="number" className={inputCls} value={form.tax ?? 0}
            onChange={(e) => set('tax', Number(e.target.value))} />
        </Field>
        <Field label="최종 금액" required>
          <input type="number" className={inputCls + ' font-bold text-indigo-600'}
            value={form.total_amount ?? 0}
            onChange={(e) => set('total_amount', Number(e.target.value))} />
        </Field>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleReset}
          className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors text-sm"
        >
          변경 취소
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
        >
          {saving ? '저장 중...' : '수정 저장'}
        </button>
      </div>
    </div>
  )
}
