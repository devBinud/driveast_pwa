import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiNavigation, FiClock, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useRequestStore } from '../../../store/requestStore'
import { useTripStore } from '../../../store/tripStore'
import { useDriverStore } from '../../../store/driverStore'
import './RideRequestModal.css'

const playIncomingChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    const audioCtx = new AudioContextClass()
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }

    // High urgency dual-tone driver alert siren
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    // Use triangle/sawtooth for punchy, piercing sound that cuts through car/road noise
    osc.type = 'triangle'
    const now = audioCtx.currentTime

    // Loud, clear volume (0.4 vs previous 0.08 whisper)
    gainNode.gain.setValueAtTime(0.45, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6)

    // Pulsing two-tone alert siren (800Hz -> 1050Hz -> 800Hz)
    osc.frequency.setValueAtTime(784.00, now)         // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.15) // C6
    osc.frequency.setValueAtTime(784.00, now + 0.3)   // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.45) // C6

    osc.start(now)
    osc.stop(now + 0.6)
  } catch (error) {
    console.warn('Audio Context failed for incoming chime:', error)
  }
}

export const RideRequestModal = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { requests, declineRequest, acceptRequest, isMinimized, setMinimized } = useRequestStore()
  const { currentTrip, setAssignedTrip } = useTripStore()
  const isOnline = useDriverStore((state) => state.isOnline)

  const prevCountRef = useRef(requests.length)
  useEffect(() => {
    if (requests.length > prevCountRef.current) {
      setMinimized(false)
    }
    prevCountRef.current = requests.length
  }, [requests.length, setMinimized])

  const isAvailable = !!(isOnline && !currentTrip && requests.length > 0)
  const isRequestsPage = location.pathname === '/requests'
  const showModal = isAvailable && !isMinimized && !isRequestsPage

  useEffect(() => {
    if (showModal) {
      const isAlertSoundEnabled = localStorage.getItem('ride_alerts_enabled') !== 'false'

      // Heavy, urgent vibration pulses designed for drivers driving in car / noisy vehicle
      if (navigator.vibrate) {
        navigator.vibrate([500, 150, 500, 150, 500])
      }
      if (isAlertSoundEnabled) {
        playIncomingChime()
      }

      const chimeInterval = setInterval(() => {
        if (isAlertSoundEnabled) {
          playIncomingChime()
        }
      }, 1200)

      const vibrateInterval = setInterval(() => {
        if (navigator.vibrate) {
          navigator.vibrate([400, 150, 400])
        }
      }, 2000)

      return () => {
        clearInterval(chimeInterval)
        clearInterval(vibrateInterval)
      }
    }
  }, [showModal])

  if (!showModal) {
    return null
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDecline = async (id, e) => {
    e.stopPropagation()
    await declineRequest(id)
  }

  const handleAccept = async (req, e) => {
    e.stopPropagation()
    try {
      // acceptRequest resolves with { assignment_id, booking_id, status } from the
      // backend. That assignment_id is the real DriverAssignment id -- distinct from
      // req.id (the DriverBookingRequest id for the pending offer). Wiring req.id into
      // currentTrip.assignmentId here (as this used to do, before acceptRequest even
      // ran) meant every subsequent trip action -- arrive, verify-otp, end-trip -- was
      // called against an id that only ever matched a request row, never an
      // assignment, so the backend correctly 404'd every time.
      const result = await acceptRequest(req.id)
      setAssignedTrip({ ...req, assignmentId: result?.assignment_id })
      navigate('/trips/assigned')
    } catch (err) {
      toast.error(err?.message || 'Failed to accept this ride. Please try again.')
    }
  }

  return (
    <div className={`request-modal-backdrop ${showModal ? 'show' : ''}`}>
      <div className="request-modal-wrapper">
        
        {/* Global Modal Header */}
        <div className="request-modal-list-header">
          <div className="header-top-row">
            <div className="header-brand-group">
              <div className="modal-brand-avatar" aria-label="Driveast">
                <span>D</span>
              </div>
              <div className="status-badge">
                <span>{requests.length} Incoming {requests.length > 1 ? 'Rides' : 'Ride'}</span>
              </div>
            </div>
            
            {/* Minimize Button */}
            <button 
              type="button" 
              onClick={() => setMinimized(true)}
              className="btn-modal-minimize"
              aria-label="Minimize"
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
            const maxTime = 900
            const timeLeft = req.timeLeft || 0
            const percent = Math.min((timeLeft / maxTime) * 100, 100)

            const radius = 22
            const circumference = 2 * Math.PI * radius
            const strokeDashoffset = circumference - (percent / 100) * circumference
            const isUrgent = timeLeft < 30

            return (
              <div key={req.id} className="request-modal-card animate-fade-in">
                {/* Card Header */}
                <div className="request-modal-card-header">
                  <span className="req-id-badge">{req.bookingNumber || req.id}</span>
                  
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
                    ₹{(Number(req.fare) || 0).toFixed(2)}
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
                    {req.distance && (
                      <div className="modal-stat-item">
                        <FiNavigation />
                        <strong>{req.distance}</strong>
                      </div>
                    )}
                    {req.passengers && (
                      <div className="modal-stat-item">
                        <FiClock />
                        <strong>{req.passengers} Passengers</strong>
                      </div>
                    )}
                  </div>

                  <div className="modal-customer">
                    <FiUser className="cust-icon" />
                    <div className="cust-det">
                      <span className="cust-name">{req.customerName || 'Lead Traveler'}</span>
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
