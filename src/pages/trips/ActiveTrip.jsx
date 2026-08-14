import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiNavigation, FiActivity } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import { Input } from '../../components/common/Input/Input'
import { OdometerPhotoCapture } from '../../components/trips/OdometerPhotoCapture/OdometerPhotoCapture'
import './ActiveTrip.css'

export const ActiveTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, endTrip, isLoadingTrip } = useTripStore()
  const [endOdo, setEndOdo] = useState('45340')
  const [endOdoImageUrl, setEndOdoImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showOdoModal, setShowOdoModal] = useState(false)

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleEndTripClick = () => {
    setShowOdoModal(true)
  }

  const handleConfirmEndTrip = async () => {
    if (!endOdoImageUrl) return
    setLoading(true)
    await endTrip(Number(endOdo) || 45340, endOdoImageUrl)
    setLoading(false)
    navigate('/trips/payment')
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
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowOdoModal(false)}
              style={{ flex: 1 }}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmEndTrip}
              disabled={loading || isLoadingTrip || !endOdo || !endOdoImageUrl}
              style={{ flex: 1 }}
            >
              Confirm & End Trip
            </button>
          </div>
        </div>
      )}

      {!showOdoModal && (
        <div className="active-action-panel">
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
