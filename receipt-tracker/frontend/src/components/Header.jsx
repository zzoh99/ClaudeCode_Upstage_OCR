import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const isUpload = location.pathname === '/upload'

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm h-16 flex items-center">
      <div className="max-w-4xl mx-auto w-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors">
          <span>🧾</span>
          <span>영수증 관리</span>
        </Link>
        {!isUpload && (
          <Link
            to="/upload"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            + 영수증 추가
          </Link>
        )}
      </div>
    </header>
  )
}
