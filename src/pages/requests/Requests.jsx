import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiNavigation, FiClock, FiStar, FiCalendar } from 'react-icons/fi'
import { useRequestStore } from '../../store/requestStore'
import { useTripStore } from '../../store/tripStore'
import { RequestCard } from '../../components/requests/RequestCard/RequestCard'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import './Requests.css'

export const Requests = () => {
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = useState('incoming')

  const { requests, declineRequest, addMockRequest } = useRequestStore()

  const {
    upcomingTrips,
    setAssignedTrip
  } = useTripStore()

  const handleAccept = (req) => {
    setAssignedTrip(req)
    declineRequest(req.id) // Remove from request queue
    navigate('/trips/assigned') // Navigate to active heading to pickup screen
  }

  const handleDecline = (id) => {
    declineRequest(id)
  }

  const handleViewDetails = (id) => {
    navigate(`/requests/${id}`)
  }

  // Transition a scheduled upcoming trip to the active trip state
  const startUpcomingTrip = (trip) => {
    // 1. Remove from upcoming list in store
    useTripStore.setState((state) => ({
      upcomingTrips: state.upcomingTrips.filter((t) => t.id !== trip.id)
    }))

    // 2. Set as active trip
    setAssignedTrip({
      id: trip.id.replace('SCH-', 'REQ-'),
      pickup: trip.pickup,
      drop: trip.drop,
      distance: trip.distance,
      duration: trip.duration,
      fare: trip.fare,
      timeLeft: 600,
      customerName: trip.customerName,
      customerPhone: trip.customerPhone,
      customerAvatar: trip.customerAvatar,
      customerRating: trip.customerRating
    })

    // 3. Navigate directly to active heading to pickup screen
    navigate('/trips/assigned')
  }

  return (
    <div className="page-container animate-fade-in requests-page-container">
      {/* Header Info */}
      <div>
        <h2>Rides & Bookings</h2>
        <p className="requests-sub">Manage your incoming requests and scheduled bookings</p>
      </div>

      {/* Segmented Sub-Tab Pills */}
      <div className="sub-tabs-container">
        <button
          type="button"
          className={`sub-tab-pill ${activeSubTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('incoming')}
        >
          Incoming Rides
        </button>
        <button
          type="button"
          className={`sub-tab-pill ${activeSubTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('upcoming')}
        >
          Upcoming Trips ({upcomingTrips.length})
        </button>
      </div>

      {/* Sub-Tab Contents */}
      {activeSubTab === 'incoming' ? (
        requests.length === 0 ? (
          <div className="incoming-empty-area animate-tab-fade">
            <EmptyState
              title="Waiting for Requests..."
              description="We will notify you immediately as soon as a new trip becomes available in your area."
              actionLabel="Simulate Incoming Request"
              onActionClick={addMockRequest}
              type="requests"
            />
          </div>
        ) : (
          <div className="requests-list-container animate-tab-fade" style={{ marginTop: 'var(--spacing-md)' }}>
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
        )
      ) : (
        /* Upcoming Trips tab pill content */
        <div className="upcoming-trips-tab-content animate-tab-fade">
          {upcomingTrips.length === 0 ? (
            <EmptyState
              title="No Upcoming Trips"
              description="You have no scheduled bookings or upcoming trips assigned to you at the moment."
              type="trips"
            />
          ) : (
            <div className="upcoming-trips-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="request-modal-card upcoming-trip-card">
                  {/* Card Header: ID & Scheduled Time */}
                  <div className="request-modal-card-header" style={{ justifyContent: 'space-between', paddingBottom: 'var(--spacing-xs)' }}>
                    <span className="req-id-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      {trip.id}
                    </span>
                    <span className="upcoming-time-badge" style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: '800' }}>
                      {trip.time}
                    </span>
                  </div>

                  {/* Scheduled Date Section */}
                  <div className="upcoming-date-section" style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', margin: '10px 0 var(--spacing-xs) 0' }}>
                    <FiCalendar style={{ fontSize: '0.9rem' }} />
                    <span>{trip.date}</span>
                  </div>

                  {/* Estimated Fare Section */}
                  <div className="modal-fare-section" style={{ margin: 'var(--spacing-xs) 0' }}>
                    <div className="modal-fare-label">
                      <span>Estimated Earnings</span>
                    </div>
                    <div className="modal-fare-amount" style={{ fontSize: '1.45rem' }}>
                      ₹{trip.fare.toFixed(2)}
                    </div>
                  </div>

                  {/* Route Indicator Dots */}
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

                  {/* Navigation Details & Rider Name */}
                  <div className="modal-info-grid" style={{ paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="modal-stats">
                      <div className="modal-stat-item">
                        <FiNavigation />
                        <span>{trip.distance}</span>
                      </div>
                      <div className="modal-stat-item">
                        <FiClock />
                        <span>{trip.duration}</span>
                      </div>
                    </div>
                    <div className="modal-customer">
                      <div className="cust-det">
                        <span className="cust-name" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{trip.customerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Trigger */}
                  <div className="upcoming-action-row" style={{ marginTop: 'var(--spacing-md)' }}>
                    <button
                      type="button"
                      className="btn-modal-accept w-full"
                      onClick={() => startUpcomingTrip(trip)}
                    >
                      Start Trip Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Requests
