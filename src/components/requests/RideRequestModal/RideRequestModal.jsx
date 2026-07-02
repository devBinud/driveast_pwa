import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiNavigation, FiClock, FiStar } from 'react-icons/fi'
import { useRequestStore } from '../../../store/requestStore'
import { useTripStore } from '../../../store/tripStore'
import { useDriverStore } from '../../../store/driverStore'
import './RideRequestModal.css'

export const RideRequestModal = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { requests, declineRequest, acceptRequest, isMinimized, setMinimized } = useRequestStore()
  const { currentTrip, setAssignedTrip } = useTripStore()
  const isOnline = useDriverStore((state) => state.isOnline)

  // Track request count to auto-maximize modal when a new request arrives
  const prevCountRef = useRef(requests.length)
  useEffect(() => {
    if (requests.length > prevCountRef.current) {
      setMinimized(false)
    }
    prevCountRef.current = requests.length
  }, [requests.length, setMinimized])

  // Active if online, no current trip, and there is at least one request
  const isAvailable = !!(isOnline && !currentTrip && requests.length > 0)
  const isRequestsPage = location.pathname === '/requests'
  const showModal = isAvailable && !isMinimized && !isRequestsPage

  if (!showModal) {
    return null
  }

  // Format seconds into MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDecline = (id, e) => {
    e.stopPropagation()
    declineRequest(id)
  }

  const handleAccept = (req, e) => {
    e.stopPropagation()
    setAssignedTrip(req)
    acceptRequest(req.id)
    navigate('/trips/assigned') // Navigate to Heading to Pickup screen
  }

  return (
    <div className={`request-modal-backdrop ${showModal ? 'show' : ''}`}>
      <div className="request-modal-wrapper">
        
        {/* Global Modal Header */}
        <div className="request-modal-list-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo/driveast_logo.jpg" alt="Driveast Logo" style={{ height: '24px', borderRadius: '4px', border: '1px solid #e4e4e7' }} />
              <div className="status-ping">
                <span>{requests.length} Incoming {requests.length > 1 ? 'Rides' : 'Ride'}</span>
              </div>
            </div>
            
            {/* Close / Minimize Button */}
            <button 
              type="button" 
              onClick={() => setMinimized(true)}
              className="btn-modal-minimize"
              aria-label="Minimize"
              style={{
                background: '#f4f4f5',
                color: '#09090b',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                padding: 0
              }}
            >
              ✕
            </button>
          </div>
          <hr className="modal-header-divider" />
          <h3>Select or Decline Rides</h3>
        </div>

        {/* Scrollable list of request cards */}
        <div className="request-modal-list scroll-container">
          {requests.map((req) => {
            const maxTime = 20 // 20 seconds maximum timer
            const timeLeft = req.timeLeft
            const percent = Math.min((timeLeft / maxTime) * 100, 100)

            const radius = 22
            const circumference = 2 * Math.PI * radius
            const strokeDashoffset = circumference - (percent / 100) * circumference
            const isUrgent = timeLeft < 5 // under 5 seconds is urgent

            return (
              <div key={req.id} className="request-modal-card animate-fade-in">
                {/* Card Header (Request ID Badge + Timer) */}
                <div className="request-modal-card-header">
                  <span className="req-id-badge">{req.id}</span>
                  
                  {/* Timer Ring */}
                  <div className="request-modal-timer">
                    <svg className="timer-svg" width="56" height="56" viewBox="0 0 56 56">
                      <circle 
                        className="timer-circle-bg" 
                        cx="28" 
                        cy="28" 
                        r={radius} 
                      />
                      <circle
                        className="timer-circle-val"
                        cx="28"
                        cy="28"
                        r={radius}
                        stroke={isUrgent ? '#ef4444' : '#fbbf24'}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                    <span className="timer-text" style={{ color: isUrgent ? '#ef4444' : '#09090b' }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Fare Section */}
                <div className="modal-fare-section">
                  <div className="modal-fare-label">
                    <span>Estimated Earnings</span>
                  </div>
                  <div className="modal-fare-amount">
                    ₹{req.fare.toFixed(2)}
                  </div>
                </div>

                {/* Route Details */}
                <div className="modal-route-details">
                  <div className="modal-route-indicator">
                    <span className="dot-p"></span>
                    <span className="line-connect"></span>
                    <span className="dot-d"></span>
                  </div>
                  
                  <div className="modal-route-text">
                    <div className="route-item">
                      <span className="route-lbl">Pickup Address</span>
                      <span className="route-addr">{req.pickup}</span>
                    </div>
                    <div className="route-item">
                      <span className="route-lbl">Dropoff Address</span>
                      <span className="route-addr">{req.drop}</span>
                    </div>
                  </div>
                </div>

                {/* Info Grid & Customer */}
                <div className="modal-info-grid">
                  <div className="modal-stats">
                    <div className="modal-stat-item">
                      <FiNavigation />
                      <strong>{req.distance} away</strong>
                    </div>
                    <div className="modal-stat-item">
                      <FiClock />
                      <strong>{req.duration} est.</strong>
                    </div>
                  </div>

                  <div className="modal-customer">
                    <div className="cust-det">
                      <span className="cust-name">{req.customerName}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-modal-decline" 
                    onClick={(e) => handleDecline(req.id, e)}
                  >
                    Decline
                  </button>
                  <button 
                    type="button" 
                    className="btn-modal-accept" 
                    onClick={(e) => handleAccept(req, e)}
                  >
                    Accept Ride
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RideRequestModal
