import React, { useCallback, useEffect, useRef } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { FiRefreshCw } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { useBackgroundRequestActions } from '../hooks/useBackgroundRequestActions'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useRequestStore } from '../store/requestStore'
import { useTripStore } from '../store/tripStore'
import { useDriverStore } from '../store/driverStore'
import { useWalletStore } from '../store/walletStore'
import { websocketService } from '../services/websocketService'
import { pushNotificationService } from '../services/pushNotificationService'
import { BottomNavigation } from '../components/navigation/BottomNavigation/BottomNavigation'
import { RideRequestModal } from '../components/requests/RideRequestModal/RideRequestModal'
import { DutyStatusModal } from '../components/dashboard/StatusCard/DutyStatusModal'
import './MainLayout.css'

// Pull-to-refresh is only meaningful on the 4 main bottom-nav tabs -- sub-screens
// (request details, trip flow steps, profile) have no independent "refresh my data"
// action, and enabling it there would just be confusing.
const PULL_TO_REFRESH_ROUTES = new Set(['/', '/requests', '/trips', '/wallet', '/profile'])

export const MainLayout = () => {
  const { isAuthenticated, token, fetchProfile } = useAuthStore()
  const location = useLocation()
  const tickTimers = useRequestStore((state) => state.tickTimers)
  const fetchPendingRequests = useRequestStore((state) => state.fetchPendingRequests)
  const initWebSocketListeners = useRequestStore((state) => state.initWebSocketListeners)
  const { requests, isMinimized, setMinimized } = useRequestStore()
  const currentTrip = useTripStore((state) => state.currentTrip)
  const initTripWebSocketListeners = useTripStore((state) => state.initWebSocketListeners)
  const fetchTripsHistory = useTripStore((state) => state.fetchTripsHistory)
  const fetchWalletSummary = useWalletStore((state) => state.fetchSummary)
  const fetchWalletAll = useWalletStore((state) => state.fetchAll)

  const {
    isOnline,
    toggleOnline,
    isDutyModalOpen,
    setDutyModalOpen,
    syncStatus
  } = useDriverStore()
  
  useNotifications()
  useBackgroundRequestActions()

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().then((profile) => {
        if (profile?.availability_status) {
          syncStatus(profile.availability_status)
        }
      })
      if (token) {
        websocketService.connectDriverWs(token)
      }
      const cleanupWs = initWebSocketListeners()
      const cleanupTripWs = initTripWebSocketListeners()
      fetchPendingRequests()
      fetchWalletSummary()
      pushNotificationService.subscribeSilently()

      // Safety-net polling: the WebSocket push can silently fail to reach this device
      // (dropped connection, backgrounded app/OS throttling, server-side delivery issue)
      // with nothing visibly wrong in the UI. Poll periodically so a new request still
      // shows up within a few seconds even if the real-time push never arrives.
      const pollInterval = setInterval(() => {
        fetchPendingRequests()
      }, 6000)

      return () => {
        if (cleanupWs) cleanupWs()
        if (cleanupTripWs) cleanupTripWs()
        clearInterval(pollInterval)
      }
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimers()
    }, 1000)
    return () => clearInterval(interval)
  }, [tickTimers])

  const scrollContainerRef = useRef(null)

  const handlePullToRefresh = useCallback(async () => {
    switch (location.pathname) {
      case '/':
        await Promise.all([fetchWalletSummary(), fetchTripsHistory(), fetchPendingRequests()])
        break
      case '/requests':
        await fetchPendingRequests()
        break
      case '/trips':
        await fetchTripsHistory()
        break
      case '/wallet':
        await fetchWalletAll()
        break
      case '/profile':
        await fetchProfile()
        break
      default:
        break
    }
  }, [location.pathname, fetchWalletSummary, fetchTripsHistory, fetchPendingRequests, fetchWalletAll, fetchProfile])

  const { pullDistance, isRefreshing, threshold } = usePullToRefresh(
    scrollContainerRef,
    handlePullToRefresh,
    PULL_TO_REFRESH_ROUTES.has(location.pathname)
  )

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
      <main
        ref={scrollContainerRef}
        className={`main-content scroll-container${showMinimizedBar ? ' has-banner' : ''}`}
      >
        {(pullDistance > 0 || isRefreshing) && (
          <div
            className="pull-to-refresh-indicator"
            style={{ height: `${isRefreshing ? threshold : pullDistance}px` }}
          >
            <FiRefreshCw className={isRefreshing || pullDistance >= threshold ? 'spinning' : ''} />
          </div>
        )}
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
