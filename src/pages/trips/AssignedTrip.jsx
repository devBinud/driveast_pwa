import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiCompass, FiMapPin } from 'react-icons/fi'
import { useTripStore, getTripStatusRoute } from '../../store/tripStore'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import { Button } from '../../components/common/Button/Button'
import './AssignedTrip.css'

export const AssignedTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, hasHydrated, syncCurrentTrip, startNavigationToPickup, arriveAtPickup, isLoadingTrip } = useTripStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    syncCurrentTrip()
  }, [syncCurrentTrip])

  // Persisted trip state restores from localStorage a tick after first render --
  // redirecting away before that finishes would wrongly bounce a driver out of
  // an in-progress trip on a fresh page load (e.g. app killed while backgrounded).
  if (!hasHydrated) {
    return null
  }

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  // The backend may have already moved this assignment past "assigned" --
  // e.g. arriveAtPickup() succeeded server-side but the app got killed before
  // the response updated currentTrip.status locally. syncCurrentTrip() (above)
  // corrects that status from the backend on mount; once it does, send the
  // driver to whichever screen actually matches where they really are instead
  // of leaving them on this one with a now-nonfunctional "I've Arrived" button.
  const correctRoute = getTripStatusRoute(currentTrip.status)
  if (correctRoute && correctRoute !== '/trips/assigned') {
    return <Navigate to={correctRoute} replace />
  }

  // Opens Google Maps directly in turn-by-turn navigation mode (dir_action=navigate
  // auto-starts guidance on supported platforms, mainly Android with the Maps app
  // installed, instead of just dropping a pin the driver still has to tap Start on).
  // Coordinates are used when the backend has them (precise); falls back to the
  // address string, which Maps geocodes itself, if not.
  const handleNavigate = () => {
    const { pickupLat, pickupLng, pickup } = currentTrip
    const destination = (pickupLat && pickupLng)
      ? `${pickupLat},${pickupLng}`
      : encodeURIComponent(pickup || '')
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`
    window.open(url, '_blank', 'noopener')
    startNavigationToPickup()
  }

  const handleArrived = async () => {
    setLoading(true)
    await arriveAtPickup()
    setLoading(false)
    navigate('/trips/otp')
  }

  const isNavigating = currentTrip.status === 'navigating'

  return (
    <div className="assigned-trip-page page-container animate-fade-in">
      <div className="assigned-status-header">
        <span className="status-badge-inline">{isNavigating ? 'Navigating to Pickup' : 'Heading to Pickup'}</span>
        {(currentTrip.distance || currentTrip.duration) && (
          <span className="status-subtitle-inline">Route: {currentTrip.distance || '—'} • {currentTrip.duration || '—'}</span>
        )}
      </div>

      <div className="assigned-status-view">
        <div className="status-graphic-container">
          <div className="status-pulse-circle">
            <FiCompass className="compass-icon-large animate-spin-slow" />
          </div>
          <h3>{isNavigating ? 'Navigating to Pickup' : 'Heading to Pickup'}</h3>
          <p>Drive safely to pickup: {currentTrip.pickup}</p>
        </div>
      </div>

      <div className="assigned-action-panel">
        <div style={{ marginBottom: '0.75rem' }}>
          <Button
            variant="secondary"
            icon={FiMapPin}
            onClick={handleNavigate}
            fullWidth
            size="lg"
          >
            Navigate to Pickup
          </Button>
        </div>
        <ActiveTripCard
          trip={currentTrip}
          primaryActionLabel="I've Arrived at Pickup"
          onPrimaryAction={handleArrived}
          loading={loading || isLoadingTrip}
        />
      </div>
    </div>
  )
}

export default AssignedTrip
