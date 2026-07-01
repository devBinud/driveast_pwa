import React from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { BottomNavigation } from '../components/navigation/BottomNavigation/BottomNavigation'
import { Footer } from '../components/common/Footer/Footer'
import './MainLayout.css'

export const MainLayout = () => {
  const { isAuthenticated, user } = useAuth()
  useNotifications() // Global listener: shows toast alerts on all pages when a new request arrives

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="main-header glass-panel">
        <div className="header-inner">
          <div className="header-logo-container">
            <Link to="/" className="header-logo-link">
              <img src="/logo/driveast_logo.jpg" alt="Driveast Logo" className="header-logo-img" />
            </Link>
            <span className="header-partner-tag">partner</span>
          </div>

          <div className="header-actions">
            {/* Header actions cleared for a cleaner look */}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content scroll-container">
        <Outlet />
        <Footer />
      </main>

      {/* Navigation */}
      <BottomNavigation />
    </div>
  )
}
export default MainLayout
