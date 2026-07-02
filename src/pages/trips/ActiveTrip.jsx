import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiNavigation } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import './ActiveTrip.css'

export const ActiveTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, arriveAtDropoff } = useTripStore()
  const [loading, setLoading] = useState(false)

  // Redirect to dashboard if no trip is active
  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleComplete = () => {
    setLoading(true)
    setTimeout(() => {
      arriveAtDropoff() // Change status to payment_pending
      setLoading(false)
      navigate('/trips/payment')
    }, 800)
  }

  return (
    <div className="active-trip-page page-container animate-fade-in">
      {/* Header status details */}
      <div className="active-status-header">
        <span className="status-badge-inline active-run">En Route to Destination</span>
        <span className="status-subtitle-inline">Driving towards dropoff point</span>
      </div>

      {/* Main visual status display instead of Map */}
      <div className="active-status-view">
        <div className="status-graphic-container">
          <div className="status-pulse-circle active-trip">
            <FiNavigation className="navigation-icon-large animate-pulse" />
          </div>
          <h3>Trip In Progress</h3>
          <p>Driving customer safely to their dropoff address.</p>
        </div>
        </div>

      {/* Active Trip panel */}
      <div className="active-action-panel">
        <ActiveTripCard
          trip={currentTrip}
          primaryActionLabel="Tap to End Trip (Arrive)"
          onPrimaryAction={handleComplete}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default ActiveTrip
