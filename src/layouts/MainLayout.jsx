import React, { useEffect } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { useRequestStore } from '../store/requestStore'
import { useTripStore } from '../store/tripStore'
import { useDriverStore } from '../store/driverStore'
import { websocketService } from '../services/websocketService'
import { BottomNavigation } from '../components/navigation/BottomNavigation/BottomNavigation'
import { RideRequestModal } from '../components/requests/RideRequestModal/RideRequestModal'
import { DutyStatusModal } from '../components/dashboard/StatusCard/DutyStatusModal'
import './MainLayout.css'

export const MainLayout = () => {
  const { isAuthenticated, token, fetchProfile } = useAuthStore()
  const location = useLocation()
  const tickTimers = useRequestStore((state) => state.tickTimers)
  const fetchPendingRequests = useRequestStore((state) => state.fetchPendingRequests)
  const initWebSocketListeners = useRequestStore((state) => state.initWebSocketListeners)
  const { requests, isMinimized, setMinimized } = useRequestStore()
  const currentTrip = useTripStore((state) => state.currentTrip)
  
  const { 
    isOnline, 
    toggleOnline, 
    isDutyModalOpen, 
    setDutyModalOpen 
  } = useDriverStore()
  
  useNotifications()

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
      if (token) {
        websocketService.connectDriverWs(token)
      }
      const cleanupWs = initWebSocketListeners()
      fetchPendingRequests()

      return () => {
        if (cleanupWs) cleanupWs()
      }
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimers()
    }, 1000)
    return () => clearInterval(interval)
  }, [tickTimers])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isRequestsPage = location.pathname === '/requests'
  const showMinimizedBar = isOnline && !currentTrip && requests.length > 0 && isMinimized && !isRequestsPage

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
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`main-content scroll-container${showMinimizedBar ? ' has-banner' : ''}`}>
        <Outlet />
      </main>

      {/* Navigation */}
      <BottomNavigation />

      {/* Minimized Requests Floating Banner */}
      {showMinimizedBar && (
        <div 
          className="minimized-requests-banner"
          onClick={() => setMinimized(false)}
        >
          <span className="ping-dot"></span>
          <span className="banner-text">
            {requests.length} Incoming Ride {requests.length > 1 ? 'Offers' : 'Offer'} Available
          </span>
          <span className="banner-action-lbl">
            TAP TO VIEW
          </span>
        </div>
      )}

      {/* Global Ride Request Popup */}
      <RideRequestModal />

      {/* Global Driver Duty Status bottom sheet */}
      {isDutyModalOpen && (
        <DutyStatusModal
          isOnline={isOnline}
          onGoOnline={() => { if (!isOnline) toggleOnline() }}
          onGoOffline={() => { if (isOnline) toggleOnline() }}
          onClose={() => setDutyModalOpen(false)}
        />
      )}
    </div>
  )
}
export default MainLayout
