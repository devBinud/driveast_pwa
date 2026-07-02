import React from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { useRequestStore } from '../store/requestStore'
import { useTripStore } from '../store/tripStore'
import { useDriverStore } from '../store/driverStore'
import { BottomNavigation } from '../components/navigation/BottomNavigation/BottomNavigation'
import { RideRequestModal } from '../components/requests/RideRequestModal/RideRequestModal'
import { DutyStatusModal } from '../components/dashboard/StatusCard/DutyStatusModal'
import './MainLayout.css'

export const MainLayout = () => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const tickTimers = useRequestStore((state) => state.tickTimers)
  const { requests, isMinimized, setMinimized } = useRequestStore()
  const currentTrip = useTripStore((state) => state.currentTrip)
  
  const { 
    isOnline, 
    toggleOnline, 
    isDutyModalOpen, 
    setDutyModalOpen 
  } = useDriverStore()
  
  useNotifications() // Global listener: shows toast alerts on all pages when a new request arrives

  // Tick request timers and active trip timer globally
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Tick available requests
      tickTimers()

      // Tick active trip timer
      const currentTripVal = useTripStore.getState().currentTrip
      if (currentTripVal && currentTripVal.timeLeft > 0 && currentTripVal.status !== 'completed' && currentTripVal.status !== 'payment_pending') {
        useTripStore.setState({
          currentTrip: {
            ...currentTripVal,
            timeLeft: currentTripVal.timeLeft - 1
          }
        })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [tickTimers])

  // Redirect to login if not authenticated
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
            {/* Header actions cleared for a cleaner look */}
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
