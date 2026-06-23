import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AuthLayout.css'

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth()

  // Redirect to home if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="auth-layout">
      {/* Background glowing decorations */}
      <div className="auth-glow-blob blob-1"></div>
      <div className="auth-glow-blob blob-2"></div>
      
      <div className="auth-card-container">
        <div className="auth-logo-section">
          <img src="/logo/driveast_logo.jpg" alt="Driveast Logo" className="auth-logo-img" />
          <p className="auth-subtitle">Driver Partner Platform</p>
        </div>
        
        <div className="auth-content glass-panel">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
export default AuthLayout
