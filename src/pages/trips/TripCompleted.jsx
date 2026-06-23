import React from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiCheckCircle, FiTrendingUp, FiNavigation, FiClock } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { Button } from '../../components/common/Button/Button'
import { Card } from '../../components/common/Card/Card'
import './TripCompleted.css'

export const TripCompleted = () => {
  const navigate = useNavigate()
  const { currentTrip, clearCurrentTrip } = useTripStore()

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleReturn = () => {
    clearCurrentTrip() // Erases currentTrip from active slot
    navigate('/')
  }

  return (
    <div className="page-container animate-fade-in completed-page-wrap">
      <div className="completed-card glass-panel text-center">
        
        {/* Animated Checkmark Badge */}
        <div className="success-badge-container">
          <FiCheckCircle className="success-badge-icon" />
        </div>
        
        <h2 className="success-title">Trip Completed!</h2>
        <p className="success-sub">Congratulations, you completed ride run {currentTrip.tripId} successfully.</p>

        {/* Stats breakdown summary */}
        <div className="completed-stats-container">
          
          <div className="completed-stat-row">
            <div className="comp-stat-lbl">
              <FiNavigation />
              <span>Distance Traveled</span>
            </div>
            <strong>{currentTrip.distance}</strong>
          </div>

          <div className="completed-stat-row">
            <div className="comp-stat-lbl">
              <FiClock />
              <span>Trip Duration</span>
            </div>
            <strong>{currentTrip.duration}</strong>
          </div>

          <div className="completed-stat-row total">
            <div className="comp-stat-lbl">
              <FiTrendingUp />
              <span>Earnings Deposited</span>
            </div>
            <strong className="text-success">₹{currentTrip.fare.toFixed(2)}</strong>
          </div>

        </div>

        <Button variant="primary" onClick={handleReturn} fullWidth size="lg">
          Back to Dashboard
        </Button>

      </div>
    </div>
  )
}
export default TripCompleted
