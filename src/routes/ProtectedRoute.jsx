import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Loader from '../components/ui/Loader.jsx'

export default function ProtectedRoute({ role, children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>
  if (!user) return <Navigate to="/auth" replace />
  if (role && profile && profile.role !== role) {
    const home = profile.role === 'teacher' ? '/teacher/dashboard' : profile.role === 'admin' ? '/admin/dashboard' : '/app/home'
    return <Navigate to={home} replace />
  }
  if (profile?.role === 'student' && !profile.level && role === 'student') {
    return <Navigate to="/placement-test" replace />
  }
  return children
}
