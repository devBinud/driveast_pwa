import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiAward, FiNavigation, FiMapPin, FiAlertCircle, FiRefreshCw, FiBell } from 'react-icons/fi'
import { FaRupeeSign } from 'react-icons/fa'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { useAuthStore } from '../../../store/authStore'
import { useLocation } from '../../../hooks/useLocation'
import { AvailabilityStatus } from '../../../services/driverService'
import { pushNotificationService } from '../../../services/pushNotificationService'
import { Card } from '../../common/Card/Card'
import './StatusCard.css'

export const StatusCard = () => {
  const { isOnline, availabilityStatus, todayEarnings, completedTripsCount, setDutyModalOpen } = useDriverStatus()
  const { user } = useAuthStore()
  const { locationDetails, permissionDenied, requestLocation } = useLocation()
  const [pushPermission, setPushPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }, [isOnline])

  const handleEnablePush = async (e) => {
    e.stopPropagation()
    await pushNotificationService.subscribe()
    if ('Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }

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

      {/* Current Location & Dispatch Area Section */}
      {isOnline && (
        <div className={`status-location-section ${permissionDenied ? 'denied' : 'active'}`}>
          {permissionDenied ? (
            <div className="location-denied-row">
              <div className="location-denied-info">
                <FiAlertCircle className="location-denied-icon" />
                <div className="location-denied-text">
                  <strong>Location Access Disabled</strong>
                  <span>Enable browser GPS to receive ride requests</span>
                </div>
              </div>
              <button 
                type="button" 
                className="location-retry-action-btn" 
                onClick={(e) => {
                  e.stopPropagation()
                  requestLocation()
                }}
              >
                <FiRefreshCw />
                <span>Enable GPS</span>
              </button>
            </div>
          ) : (
            <div className="status-location-panel">
              <div className="location-panel-left">
                <div className="location-icon-bubble">
                  <FiMapPin />
                </div>
                <div className="location-text-col">
                  <span className="location-kicker">CURRENT DISPATCH LOCATION</span>
                  <h4 className="location-place-title">
                    {locationDetails?.placeName || 'Guwahati'}
                  </h4>
                  <span className="location-city-subtitle">
                    {locationDetails?.cityName || 'Assam, India'}
                  </span>
                </div>
              </div>

              <div className="location-panel-right">
                <div className="gps-live-pill">
                  <span className="gps-pulse-dot"></span>
                  <span>LIVE GPS</span>
                </div>
                <button 
                  type="button" 
                  className="location-refresh-btn" 
                  onClick={(e) => {
                    e.stopPropagation()
                    requestLocation()
                  }}
                  title="Recalibrate & Refresh Location"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Push Notification Alert when Online */}
      {isOnline && pushPermission !== 'granted' && (
        <div className="status-push-alert-row">
          <div className="push-alert-info">
            <FiBell className="push-alert-icon" />
            <div className="push-alert-text">
              <strong>Push Notifications Off</strong>
              <span>Turn on alerts to get ride offers when phone is locked</span>
            </div>
          </div>
          <button
            type="button"
            className="push-alert-action-btn"
            onClick={handleEnablePush}
          >
            Turn On
          </button>
        </div>
      )}
    </Card>
  )
}
export default StatusCard

