import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import EditJob from './pages/EditJob'
import AdminPanel from './pages/AdminPanel'
import { getUser } from './utils/auth'

function ProtectedRoute({ children, adminOnly = false }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/add-job" element={
          <ProtectedRoute><AddJob /></ProtectedRoute>
        } />
        <Route path="/edit-job/:id" element={
          <ProtectedRoute><EditJob /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}