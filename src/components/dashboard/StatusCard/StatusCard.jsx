import React from 'react'
import { Link } from 'react-router-dom'
import { FiAward, FiNavigation, FiMapPin, FiAlertCircle } from 'react-icons/fi'
import { FaRupeeSign } from 'react-icons/fa'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { useAuthStore } from '../../../store/authStore'
import { useLocation } from '../../../hooks/useLocation'
import { AvailabilityStatus } from '../../../services/driverService'
import { Card } from '../../common/Card/Card'
import './StatusCard.css'

export const StatusCard = () => {
  const { isOnline, availabilityStatus, todayEarnings, completedTripsCount, setDutyModalOpen } = useDriverStatus()
  const { user } = useAuthStore()
  const { isTracking, permissionDenied } = useLocation()

  const getStatusHeading = () => {
    switch (availabilityStatus) {
      case AvailabilityStatus.AVAILABLE:
        return 'Online & Active'
      case AvailabilityStatus.OFFLINE:
        return 'Offline'
      case AvailabilityStatus.TEMP_UNAVAILABLE:
        return 'Taking a Break'
      case AvailabilityStatus.ON_LEAVE:
        return 'On Leave'
      case AvailabilityStatus.ON_TRIP:
        return 'On Active Trip'
      default:
        return isOnline ? 'Online & Active' : 'Offline'
    }
  }

  const getToggleLabel = () => {
    switch (availabilityStatus) {
      case AvailabilityStatus.AVAILABLE:
        return 'ONLINE'
      case AvailabilityStatus.OFFLINE:
        return 'OFFLINE'
      case AvailabilityStatus.TEMP_UNAVAILABLE:
        return 'ON BREAK'
      case AvailabilityStatus.ON_LEAVE:
        return 'ON LEAVE'
      case AvailabilityStatus.ON_TRIP:
        return 'ON TRIP'
      default:
        return isOnline ? 'ONLINE' : 'OFFLINE'
    }
  }

  return (
    <Card className={`status-card ${isOnline ? 'online' : 'offline'}`} padding="none">
      {/* Duty Toggle header */}
      <div className="status-card-header">
        <div className="status-meta">
          <span className="status-title-label">Duty Status</span>
          <h3 className="status-text-heading">{getStatusHeading()}</h3>
        </div>

        <div
          onClick={() => setDutyModalOpen(true)}
          className={`status-toggle-switch-wrapper ${isOnline ? 'online' : 'offline'}`}
          title="Click to change duty status"
        >
          <div className="status-toggle-track">
            <span className="status-toggle-thumb"></span>
          </div>
          <span className="status-toggle-label-text">
            {getToggleLabel()}
          </span>
        </div>
      </div>

      {/* Row stats */}
      <div className="status-card-stats">
        <div className="status-stat-item">
          <div className="status-stat-icon-wrapper yellow">
            <FiAward />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Active Vehicle</span>
            <span className="status-stat-value">{user?.vehicleModel || 'Swift Dzire'}</span>
          </div>
        </div>

        <div className="status-stat-divider"></div>

        <div className="status-stat-item">
          <div className="status-stat-icon-wrapper yellow">
            <FiNavigation />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Trips Today</span>
            <span className="status-stat-value">{completedTripsCount}</span>
          </div>
        </div>

        <div className="status-stat-divider"></div>

        <Link to="/earnings" className="status-stat-item clickable-stat highlighted-stat">
          <div className="status-stat-icon-wrapper yellow">
            <FaRupeeSign />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Today's Earnings</span>
            <span className="status-stat-value">₹{todayEarnings.toFixed(2)}</span>
          </div>
        </Link>
      </div>

      {/* GPS Location Status Indicator Bar */}
      {isOnline && (
        <div className="gps-sync-status">
          {permissionDenied ? (
            <>
              <FiAlertCircle style={{ color: '#ef4444', fontSize: '1rem' }} />
              <span style={{ color: '#ef4444' }}>
                GPS Location Denied — Enable location in browser settings to receive dispatches
              </span>
            </>
          ) : (
            <>
              <span className="gps-ping-dot"></span>
              <span>GPS Live Tracking Active — Pinging location to dispatch server</span>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
export default StatusCard
