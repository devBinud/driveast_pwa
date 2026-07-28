import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiCompass } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import './AssignedTrip.css'

export const AssignedTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, startNavigationToPickup, arriveAtPickup, isLoadingTrip } = useTripStore()
  const [loading, setLoading] = useState(false)

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleAction = async () => {
    if (currentTrip.status === 'assigned') {
      setLoading(true)
      setTimeout(() => {
        startNavigationToPickup()
        setLoading(false)
      }, 500)
    } else {
      setLoading(true)
      await arriveAtPickup()
      setLoading(false)
      navigate('/trips/otp')
    }
  }

  const getButtonLabel = () => {
    if (currentTrip.status === 'assigned') return 'Navigate to Pickup'
    return 'Confirm Arrival at Pickup'
  }

  const getStatusLabel = () => {
    if (currentTrip.status === 'assigned') return 'Heading to Pickup'
    return 'Navigating to Pickup'
  }

  return (
    <div className="assigned-trip-page page-container animate-fade-in">
      <div className="assigned-status-header">
        <span className="status-badge-inline">{getStatusLabel()}</span>
        <span className="status-subtitle-inline">Route: {currentTrip.distance || '130 km'} • {currentTrip.duration || '2.5 hrs'}</span>
      </div>

      <div className="assigned-status-view">
        <div className="status-graphic-container">
          <div className="status-pulse-circle">
            <FiCompass className="compass-icon-large animate-spin-slow" />
          </div>
          <h3>{getStatusLabel()}</h3>
          <p>Drive safely to pickup: {currentTrip.pickup}</p>
        </div>
      </div>

      <div className="assigned-action-panel">
        <ActiveTripCard
          trip={currentTrip}
          primaryActionLabel={getButtonLabel()}
          onPrimaryAction={handleAction}
          loading={loading || isLoadingTrip}
        />
      </div>
    </div>
  )
}

export default AssignedTrip
