import React, { useEffect, useRef } from 'react'
import { FiClock, FiCheck, FiX, FiAlertCircle, FiMessageSquare } from 'react-icons/fi'
import { useRequestStore } from '../../store/requestStore'
import './SequentialDispatchSimulator.css'

export const SequentialDispatchSimulator = () => {
  const { dispatchSimulation, clearSimulation } = useRequestStore()
  const logEndRef = useRef(null)

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [dispatchSimulation?.logs])

  if (!dispatchSimulation) return null

  const { activeBookingId, pickup, drop, fare, status, drivers, logs } = dispatchSimulation

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted': return 'badge-success'
      case 'declined': return 'badge-danger'
      case 'timed_out': return 'badge-warning'
      case 'contacting': return 'badge-info pulse-glow'
      default: return 'badge-neutral'
    }
  }

  const getStatusText = (status, timer) => {
    switch (status) {
      case 'accepted': return 'Accepted'
      case 'declined': return 'Declined'
      case 'timed_out': return 'Timed Out'
      case 'contacting': return `Contacting (${timer}s)`
      default: return 'Pending'
    }
  }

  return (
    <div className="dispatch-sim-wrapper glass-panel animate-fade-in">
      {/* Header */}
      <div className="dispatch-sim-header">
        <div className="sim-title-group">
          <span className="sim-indicator-dot"></span>
          <h3>Location-Based Dispatch Simulator</h3>
        </div>
        <button className="btn-close-sim" onClick={clearSimulation} title="Clear Simulation">✕</button>
      </div>

      <div className="dispatch-sim-body">
        {/* Booking Details Card */}
        <div className="sim-booking-details">
          <div className="sim-booking-meta">
            <span className="sim-booking-id">{activeBookingId}</span>
            <span className="sim-booking-fare">₹{fare.toFixed(2)}</span>
          </div>
          <div className="sim-route">
            <div className="sim-route-item">
              <span className="lbl">From:</span> {pickup.split(',')[0]}
            </div>
            <div className="sim-route-item">
              <span className="lbl">To:</span> {drop.split(',')[0]}
            </div>
          </div>
        </div>

        {/* Proximity Sorted Drivers List */}
        <div className="sim-drivers-section">
          <h4>Sequential Proximity Queue (Search Radius: 5km)</h4>
          <div className="sim-drivers-list">
            {drivers.map((drv, idx) => {
              const isActive = drv.status === 'contacting'
              return (
                <div key={idx} className={`sim-driver-row ${isActive ? 'active' : ''} ${drv.status}`}>
                  <div className="driver-info">
                    <span className="driver-rank">{idx + 1}</span>
                    <div>
                      <div className="driver-name">{drv.name}</div>
                      <div className="driver-distance">{drv.distance} away</div>
                    </div>
                  </div>
                  <span className={`driver-status-badge ${getStatusBadgeClass(drv.status)}`}>
                    {getStatusText(drv.status, drv.timer)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live System Log Box */}
        <div className="sim-log-section">
          <h4>Live Server Dispatch Logs</h4>
          <div className="sim-log-box">
            {logs.map((log, index) => (
              <div key={index} className="sim-log-line">
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Admin Manual Assignment Trigger (WhatsApp Notification simulation) */}
        {status === 'manual_assignment' && (
          <div className="whatsapp-mock-alert animate-fade-in">
            <div className="wa-header">
              <div className="wa-avatar">
                <FiMessageSquare />
              </div>
              <div className="wa-meta">
                <span className="wa-sender">Driveast Server [Admin Bot]</span>
                <span className="wa-app">WhatsApp Business</span>
              </div>
              <span className="wa-time">Now</span>
            </div>
            <div className="wa-bubble">
              <p style={{ margin: 0, padding: 0 }}>
                🚨 <strong>MANUAL ASSIGNMENT REQUIRED</strong><br />
                Booking <strong>{activeBookingId}</strong> has no available drivers. Broadcast window closed. Immediate manual assignment needed.<br />
                <a href={`https://admin.driveast.com/bookings/${activeBookingId}`} target="_blank" rel="noopener noreferrer" className="wa-link" onClick={(e) => { e.preventDefault(); alert(`Simulated Admin Panel link clicked for Booking ${activeBookingId}`) }}>
                  admin.driveast.com/bookings/{activeBookingId}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SequentialDispatchSimulator
