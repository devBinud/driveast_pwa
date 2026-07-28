import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiNavigation, FiClock, FiCalendar } from 'react-icons/fi'
import { useRequestStore } from '../../store/requestStore'
import { useTripStore } from '../../store/tripStore'
import { useDriverStore } from '../../store/driverStore'
import { RequestCard } from '../../components/requests/RequestCard/RequestCard'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import './Requests.css'

export const Requests = () => {
  const navigate = useNavigate()
  const { requests, fetchPendingRequests, declineRequest, acceptRequest, isLoadingRequests } = useRequestStore()
  const isOnline = useDriverStore((state) => state.isOnline)
  const { upcomingTrips, setAssignedTrip } = useTripStore()

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const handleAccept = async (req) => {
    setAssignedTrip(req)
    await acceptRequest(req.id)
    navigate('/trips/assigned')
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

  return (
    <div className="page-container animate-fade-in requests-page-container">
      <div className="requests-header-container">
        <h2>Rides & Bookings</h2>
        <p className="requests-sub">Manage your incoming requests and scheduled bookings</p>
      </div>

      {/* Incoming Rides Section */}
      <div className="requests-section">
        <h3 className="requests-section-title">
          Incoming Rides
          {requests.length > 0 && <span className="tab-active-dot" style={{ marginLeft: '8px' }}></span>}
        </h3>
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

      <div className="requests-section-divider"></div>

      {/* Upcoming Trips Section */}
      <div className="requests-section">
        <h3 className="requests-section-title">
          Upcoming Scheduled Trips ({upcomingTrips.length})
        </h3>
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
  )
}

export default Requests
