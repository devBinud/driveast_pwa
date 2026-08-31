import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiNavigation, FiClock, FiCalendar, FiRadio } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useRequestStore } from '../../store/requestStore'
import { useTripStore } from '../../store/tripStore'
import { useDriverStore } from '../../store/driverStore'
import { RequestCard } from '../../components/requests/RequestCard/RequestCard'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import './Requests.css'

export const Requests = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'upcoming' ? 'upcoming' : 'incoming'
  const [activeTab, setActiveTab] = useState(initialTab)

  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const isHorizontalRef = useRef(null)
  const containerRef = useRef(null)
  const transitionTimeoutRef = useRef(null)

  const { requests, fetchPendingRequests, declineRequest, acceptRequest, isLoadingRequests } = useRequestStore()
  const isOnline = useDriverStore((state) => state.isOnline)
  const { upcomingTrips, setAssignedTrip } = useTripStore()

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  // Sync state if URL search params change externally
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'upcoming' && activeTab !== 'upcoming') {
      setActiveTab('upcoming')
    } else if (tabParam === 'incoming' && activeTab !== 'incoming') {
      setActiveTab('incoming')
    }
  }, [searchParams])

  const handleTabChange = (tabKey) => {
    if (activeTab === tabKey) return
    setActiveTab(tabKey)
    setSearchParams({ tab: tabKey }, { replace: true })
    setIsTransitioning(true)
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false)
    }, 320)
  }

  const handleAccept = async (req) => {
    try {
      // See RideRequestModal.jsx's handleAccept for why order matters here: req.id is
      // the pending DriverBookingRequest's id, not the DriverAssignment id the trip
      // endpoints (arrive/verify-otp/end-trip) actually key off. That id only exists
      // once acceptRequest resolves.
      const result = await acceptRequest(req.id)
      setAssignedTrip({ ...req, assignmentId: result?.assignment_id })
      navigate('/trips/assigned')
    } catch (err) {
      toast.error(err?.message || 'Failed to accept this ride. Please try again.')
    }
  }

  const handleDecline = async (id) => {
    await declineRequest(id)
  }

  const handleViewDetails = (id) => {
    navigate(`/requests/${id}`)
  }

  const startUpcomingTrip = (trip) => {
    useTripStore.setState((state) => ({
      upcomingTrips: state.upcomingTrips.filter((t) => t.id !== trip.id)
    }))

    setAssignedTrip({
      id: trip.id,
      pickup: trip.pickup,
      drop: trip.drop,
      distance: trip.distance,
      duration: trip.duration,
      fare: trip.fare,
      customerName: trip.customerName,
      customerPhone: trip.customerPhone
    })

    navigate('/trips/assigned')
  }

  // Touch handlers for fluid swiping between tabs
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    isHorizontalRef.current = null
    setIsDragging(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    const diffX = touch.clientX - touchStartRef.current.x
    const diffY = touch.clientY - touchStartRef.current.y

    // Determine direction on first significant movement
    if (isHorizontalRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          isHorizontalRef.current = true
        } else {
          isHorizontalRef.current = false
        }
      }
    }

    if (isHorizontalRef.current === true) {
      setIsDragging(true)
      const containerWidth = containerRef.current?.offsetWidth || 360

      let offset = diffX
      // Apply rubber-band resistance when pulling past the ends
      if (activeTab === 'incoming' && diffX > 0) {
        offset = diffX * 0.22
      } else if (activeTab === 'upcoming' && diffX < 0) {
        offset = diffX * 0.22
      } else {
        offset = Math.max(-containerWidth, Math.min(containerWidth, diffX))
      }
      setDragOffset(offset)
    }
  }

  const handleTouchEnd = () => {
    if (isHorizontalRef.current === true && isDragging) {
      const containerWidth = containerRef.current?.offsetWidth || 360
      const threshold = Math.min(55, containerWidth * 0.16)
      const timeElapsed = Date.now() - touchStartRef.current.time
      const isQuickSwipe = timeElapsed < 280 && Math.abs(dragOffset) > 20

      if (activeTab === 'incoming' && (dragOffset < -threshold || (isQuickSwipe && dragOffset < 0))) {
        handleTabChange('upcoming')
      } else if (activeTab === 'upcoming' && (dragOffset > threshold || (isQuickSwipe && dragOffset > 0))) {
        handleTabChange('incoming')
      }
    }

    setIsDragging(false)
    setDragOffset(0)
    isHorizontalRef.current = null
  }

  // Calculate sliding transform
  const getTrackTransform = () => {
    const isUpcoming = activeTab === 'upcoming'
    if (isDragging) {
      const basePercentage = isUpcoming ? -50 : 0
      return `translateX(calc(${basePercentage}% + ${dragOffset}px))`
    }
    return `translateX(${isUpcoming ? '-50%' : '0%'})`
  }

  const showIncomingPanel = activeTab === 'incoming' || isDragging || isTransitioning
  const showUpcomingPanel = activeTab === 'upcoming' || isDragging || isTransitioning

  return (
    <div className="page-container animate-fade-in requests-page-container">
      <div className="requests-header-container">
        <h2>Rides & Bookings</h2>
        <p className="requests-sub">Manage your incoming requests and scheduled bookings</p>
      </div>

      {/* Tabs Switcher */}
      <div className="sub-tabs-container" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'incoming'}
          className={`sub-tab-pill ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => handleTabChange('incoming')}
        >
          <FiRadio className="tab-icon" />
          <span>Incoming Rides ({requests.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'upcoming'}
          className={`sub-tab-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => handleTabChange('upcoming')}
        >
          <FiCalendar className="tab-icon" />
          <span>Upcoming Bookings ({upcomingTrips.length})</span>
        </button>
      </div>

      {/* Swipable Tabs Viewport */}
      <div
        className="tabs-swipe-viewport"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className={`tabs-swipe-track ${isDragging ? 'is-dragging' : ''}`}
          style={{ transform: getTrackTransform() }}
        >
          {/* Incoming Rides Tab Panel */}
          <div
            className={`tab-swipe-panel ${activeTab === 'incoming' ? 'panel-active' : 'panel-inactive'}`}
            style={{
              height: showIncomingPanel ? 'auto' : 0,
              visibility: showIncomingPanel ? 'visible' : 'hidden',
              overflow: showIncomingPanel ? 'visible' : 'hidden'
            }}
            role="tabpanel"
            aria-hidden={activeTab !== 'incoming'}
          >
            <div className="requests-section">
              {requests.length === 0 ? (
                <div className="incoming-empty-area">
                  <EmptyState
                    title={isOnline ? "Waiting for Real-Time Requests..." : "You Are Currently Offline"}
                    description={isOnline ? "We will alert you automatically when a new dispatch is assigned to you." : "Toggle your status to Online in the top status bar to start receiving rides."}
                    type="requests"
                  />
                </div>
              ) : (
                <div className="requests-list-container">
                  {requests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onAccept={() => handleAccept(req)}
                      onDecline={() => handleDecline(req.id)}
                      onViewDetails={() => handleViewDetails(req.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Scheduled Trips Tab Panel */}
          <div
            className={`tab-swipe-panel ${activeTab === 'upcoming' ? 'panel-active' : 'panel-inactive'}`}
            style={{
              height: showUpcomingPanel ? 'auto' : 0,
              visibility: showUpcomingPanel ? 'visible' : 'hidden',
              overflow: showUpcomingPanel ? 'visible' : 'hidden'
            }}
            role="tabpanel"
            aria-hidden={activeTab !== 'upcoming'}
          >
            <div className="requests-section">
              {upcomingTrips.length === 0 ? (
                <EmptyState
                  title="No Scheduled Trips"
                  description="You have no upcoming scheduled bookings assigned to you at the moment."
                  type="trips"
                />
              ) : (
                <div className="upcoming-trips-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {upcomingTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="request-modal-card upcoming-trip-card"
                      onClick={() => navigate(`/trips/upcoming/${trip.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="request-modal-card-header" style={{ justifyContent: 'space-between', paddingBottom: 'var(--spacing-xs)' }}>
                        <span className="req-id-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          {trip.id}
                        </span>
                        <span className="upcoming-time-badge" style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: '800' }}>
                          {trip.time}
                        </span>
                      </div>

                      <div className="upcoming-date-section" style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', margin: '10px 0 var(--spacing-xs) 0' }}>
                        <FiCalendar style={{ fontSize: '0.9rem' }} />
                        <span>{trip.date}</span>
                      </div>

                      <div className="modal-fare-section" style={{ margin: 'var(--spacing-xs) 0' }}>
                        <div className="modal-fare-label">
                          <span>Estimated Earnings</span>
                        </div>
                        <div className="modal-fare-amount" style={{ fontSize: '1.45rem' }}>
                          ₹{(Number(trip.fare) || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="modal-route-details" style={{ margin: 'var(--spacing-sm) 0' }}>
                        <div className="modal-route-indicator">
                          <span className="dot-p"></span>
                          <span className="line-connect"></span>
                          <span className="dot-d"></span>
                        </div>
                        <div className="modal-route-text">
                          <div className="route-item">
                            <span className="route-lbl">Pickup</span>
                            <span className="route-addr" style={{ fontSize: '0.8rem' }}>{trip.pickup}</span>
                          </div>
                          <div className="route-item">
                            <span className="route-lbl">Dropoff</span>
                            <span className="route-addr" style={{ fontSize: '0.8rem' }}>{trip.drop}</span>
                          </div>
                        </div>
                      </div>

                      <div className="modal-info-grid" style={{ paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="modal-stats">
                          {trip.distance && (
                            <div className="modal-stat-item">
                              <FiNavigation />
                              <span>{trip.distance}</span>
                            </div>
                          )}
                          {trip.duration && (
                            <div className="modal-stat-item">
                              <FiClock />
                              <span>{trip.duration}</span>
                            </div>
                          )}
                        </div>
                        <div className="modal-customer">
                          <div className="cust-det">
                            <span className="cust-name" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{trip.customerName || 'Lead Traveler'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="upcoming-action-row" style={{ marginTop: 'var(--spacing-md)' }}>
                        <button
                          type="button"
                          className="btn-modal-accept w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            startUpcomingTrip(trip)
                          }}
                        >
                          Start Trip Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Requests

