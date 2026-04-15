import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import ExpenseDetailPage from './pages/ExpenseDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/expense/:id" element={<ExpenseDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
