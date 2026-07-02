import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiRadio, FiNavigation, FiClock, FiPlusCircle, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useRequestStore } from '../../../store/requestStore'
import { useTripStore } from '../../../store/tripStore'
import { useDriverStore } from '../../../store/driverStore'
import { Card } from '../../common/Card/Card'
import './QuickActionCard.css'

export const QuickActionCard = () => {
  const navigate = useNavigate()
  const addMockRequest = useRequestStore((state) => state.addMockRequest)
  const currentTrip = useTripStore((state) => state.currentTrip)
  const isOnline = useDriverStore((state) => state.isOnline)

  const handleSimulateRequest = () => {
    if (!isOnline) {
      toast.error('You are currently Offline. Please go Online first to receive requests.', {
        icon: '⚠️',
        duration: 4000
      })
      return
    }
    addMockRequest()
    navigate('/requests')
  }

  const handleActiveTripNavigation = () => {
    if (!currentTrip) {
      navigate('/trips')
    } else if (currentTrip.status === 'assigned' || currentTrip.status === 'navigating' || currentTrip.status === 'arrived') {
      navigate('/trips/assigned')
    } else if (currentTrip.status === 'otp_verified' || currentTrip.status === 'active') {
      navigate('/trips/active')
    } else if (currentTrip.status === 'payment_pending') {
      navigate('/trips/payment')
    } else {
      navigate('/trips')
    }
  }

  return (
    <div className="quick-actions-container">
      <h3 className="section-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        
        {/* View Feed */}
        <Card interactive onClick={() => navigate('/requests')} className="quick-action-item">
          <div className="quick-action-icon blue">
            <FiRadio />
          </div>
          <span className="quick-action-label">Requests Feed</span>
        </Card>

        {/* View Active Trip / History */}
        <Card interactive onClick={handleActiveTripNavigation} className="quick-action-item">
          <div className={`quick-action-icon ${currentTrip ? 'purple pulse-glow-success' : 'grey'}`}>
            <FiNavigation />
          </div>
          <span className="quick-action-label">
            {currentTrip ? 'Active Trip' : 'Trip History'}
          </span>
        </Card>

        {/* Simulate incoming request */}
        <Card interactive onClick={handleSimulateRequest} className="quick-action-item trigger-simulator">
          <div className="quick-action-icon orange animate-pulse">
            <FiPlusCircle />
          </div>
          <span className="quick-action-label">Simulate Request</span>
        </Card>

        {/* User Profile */}
        <Card interactive onClick={() => navigate('/profile')} className="quick-action-item">
          <div className="quick-action-icon green">
            <FiUser />
          </div>
          <span className="quick-action-label">Profile Settings</span>
        </Card>

      </div>
    </div>
  )
}
export default QuickActionCard
