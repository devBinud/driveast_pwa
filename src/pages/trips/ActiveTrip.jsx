import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiNavigation, FiActivity, FiMapPin } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTripStore, getTripStatusRoute } from '../../store/tripStore'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import { Button } from '../../components/common/Button/Button'
import { Input } from '../../components/common/Input/Input'
import { OdometerPhotoCapture } from '../../components/trips/OdometerPhotoCapture/OdometerPhotoCapture'
import './ActiveTrip.css'

export const ActiveTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, hasHydrated, syncCurrentTrip, endTrip, isLoadingTrip } = useTripStore()
  const [endOdo, setEndOdo] = useState('45340')
  const [endOdoImageUrl, setEndOdoImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showOdoModal, setShowOdoModal] = useState(false)

  useEffect(() => {
    syncCurrentTrip()
  }, [syncCurrentTrip])

  // See AssignedTrip.jsx: persisted trip state restores a tick after first
  // render, so this must wait for hydration before treating a null currentTrip
  // as "no trip" and redirecting away.
  if (!hasHydrated) {
    return null
  }

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  // See AssignedTrip.jsx's matching guard.
  const correctRoute = getTripStatusRoute(currentTrip.status)
  if (correctRoute && correctRoute !== '/trips/active') {
    return <Navigate to={correctRoute} replace />
  }

  // Same pattern as AssignedTrip's pickup navigation: dir_action=navigate auto-starts
  // turn-by-turn guidance instead of just dropping a pin.
  const handleNavigateToDrop = () => {
    const { dropLat, dropLng, drop } = currentTrip
    const destination = (dropLat && dropLng)
      ? `${dropLat},${dropLng}`
      : encodeURIComponent(drop || '')
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`
    window.open(url, '_blank', 'noopener')
  }

  const handleEndTripClick = () => {
    setShowOdoModal(true)
  }

  const handleConfirmEndTrip = async () => {
    if (!endOdoImageUrl) return
    setLoading(true)
    // endTrip() resolves to the response data on success, or undefined on failure
    // (it sets tripError internally and swallows the error) -- this must be checked
    // before navigating, or a failed request (e.g. a validation 422) silently sends
    // the driver to the Payment screen as if the trip had actually ended.
    const result = await endTrip(Number(endOdo) || 45340, endOdoImageUrl)
    setLoading(false)
    if (result) {
      navigate('/trips/payment')
    } else {
      toast.error(useTripStore.getState().tripError || 'Failed to end trip. Please try again.')
    }
  }

  return (
    <div className="active-trip-page page-container animate-fade-in">
      <div className="active-status-header">
        <span className="status-badge-inline active-run">En Route to Destination</span>
        <span className="status-subtitle-inline">Driving towards: {currentTrip.drop}</span>
      </div>

      <div className="active-status-view">
        <div className="status-graphic-container">
          <div className="status-pulse-circle active-trip">
            <FiNavigation className="navigation-icon-large animate-pulse" />
          </div>
          <h3>Trip In Progress</h3>
          <p>Driving customer safely to their dropoff address.</p>
        </div>
      </div>

      {/* End Trip Odometer Prompt Modal / Card */}
      {showOdoModal && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Record Final Odometer</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Enter ending odometer reading to recalculate final distance and fare.
          </p>
          <Input
            label="Final Odometer Reading (KM)"
            type="number"
            step="1"
            inputMode="numeric"
            value={endOdo}
            onChange={(e) => setEndOdo(e.target.value)}
            icon={FiActivity}
            required
          />
          <OdometerPhotoCapture
            label="Final Odometer Photo"
            imageUrl={endOdoImageUrl}
            onUploaded={setEndOdoImageUrl}
          />
          <div style={{ marginTop: '1.25rem' }}>
            <Button
              variant="primary"
              onClick={handleConfirmEndTrip}
              disabled={!endOdo || !endOdoImageUrl}
              loading={loading || isLoadingTrip}
              fullWidth
              size="lg"
            >
              Confirm & End Trip
            </Button>
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <Button
                variant="ghost"
                onClick={() => setShowOdoModal(false)}
                size="sm"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {!showOdoModal && (
        <div className="active-action-panel">
          <div style={{ marginBottom: '0.75rem' }}>
            <Button
              variant="secondary"
              icon={FiMapPin}
              onClick={handleNavigateToDrop}
              fullWidth
              size="lg"
            >
              Navigate to Drop Location
            </Button>
          </div>
          <ActiveTripCard
            trip={currentTrip}
            primaryActionLabel="Tap to End Trip"
            onPrimaryAction={handleEndTripClick}
            loading={loading || isLoadingTrip}
          />
        </div>
      )}
    </div>
  )
}

export default ActiveTrip
