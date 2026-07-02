import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiCompass } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import './AssignedTrip.css'

export const AssignedTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, startNavigationToPickup, arriveAtPickup } = useTripStore()
  const [loading, setLoading] = useState(false)

  // Redirect to dashboard if no trip is active
  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleAction = () => {
    if (currentTrip.status === 'assigned') {
      setLoading(true)
      setTimeout(() => {
        startNavigationToPickup()
        setLoading(false)
      }, 500)
    } else {
      setLoading(true)
      setTimeout(() => {
        arriveAtPickup()
        setLoading(false)
        navigate('/trips/otp')
      }, 800)
    }
  }

  const getButtonLabel = () => {
    if (currentTrip.status === 'assigned') return 'Navigate to Pickup'
    return 'I Am Arrived'
  }

  const getStatusLabel = () => {
    if (currentTrip.status === 'assigned') return 'Heading to Pickup'
    return 'Navigating to Pickup'
  }

  return (
    <div className="assigned-trip-page page-container animate-fade-in">
      {/* Header status details */}
      <div className="assigned-status-header">
        <span className="status-badge-inline">{getStatusLabel()}</span>
        <span className="status-subtitle-inline">Route: {currentTrip.distance} • {currentTrip.duration} away</span>
      </div>

      {/* Main visual status display instead of Map */}
      <div className="assigned-status-view">
        <div className="status-graphic-container">
          <div className="status-pulse-circle">
            <FiCompass className="compass-icon-large animate-spin-slow" />
          </div>
          <h3>{getStatusLabel()}</h3>
          <p>Drive safely to the customer's location.</p>
        </div>
        </div>

      {/* Active Trip panel */}
      <div className="assigned-action-panel">
        <ActiveTripCard
          trip={currentTrip}
          primaryActionLabel={getButtonLabel()}
          onPrimaryAction={handleAction}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default AssignedTrip
