import React from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { FiWifi, FiWifiOff, FiStar, FiSun, FiMoon } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import { useDriverStatus } from '../hooks/useDriverStatus'
import { useTheme } from '../hooks/useTheme'
import { useNotifications } from '../hooks/useNotifications'
import { BottomNavigation } from '../components/navigation/BottomNavigation/BottomNavigation'
import { Footer } from '../components/common/Footer/Footer'
import './MainLayout.css'

export const MainLayout = () => {
  const { isAuthenticated, user } = useAuth()
  const { isOnline, toggleOnline } = useDriverStatus()
  const { theme, toggleTheme } = useTheme()
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
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <FiSun className="theme-icon sun-icon" />
              ) : (
                <FiMoon className="theme-icon moon-icon" />
              )}
            </button>

            {/* Online/Offline Status toggle */}
            <button
              onClick={toggleOnline}
              className={`status-indicator-btn ${isOnline ? 'online' : 'offline'}`}
              title={isOnline ? 'Go Offline' : 'Go Online'}
            >
              {isOnline ? (
                <>
                  <FiWifi className="wifi-icon" />
                  <span className="status-dot online pulse-glow-success"></span>
                  <span className="status-text">Online</span>
                </>
              ) : (
                <>
                  <FiWifiOff className="wifi-icon" />
                  <span className="status-dot offline"></span>
                  <span className="status-text">Offline</span>
                </>
              )}
            </button>

            {/* User profile preview */}
            {user && (
              <Link to="/profile" className="header-profile-link">
                <img src={user.avatar} alt={user.name} className="header-avatar" />
                <div className="header-rating">
                  <FiStar className="star-icon" />
                  <span>{user.rating.toFixed(2)}</span>
                </div>
              </Link>
            )}
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
