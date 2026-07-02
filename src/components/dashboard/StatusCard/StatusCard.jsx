import React from 'react'
import { FiActivity, FiAward, FiNavigation } from 'react-icons/fi'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { useAuth } from '../../../hooks/useAuth'
import { Card } from '../../common/Card/Card'
import './StatusCard.css'

export const StatusCard = () => {
  const { isOnline, acceptanceRate, completedTripsCount, setDutyModalOpen } = useDriverStatus()
  const { user } = useAuth()

  return (
    <Card className={`status-card ${isOnline ? 'online' : 'offline'}`} padding="none">
      {/* Duty Toggle header */}
      <div className="status-card-header">
        <div className="status-meta">
          <span className="status-title-label">Duty Status</span>
          <h3 className="status-text-heading">{isOnline ? 'Online & Active' : 'Offline'}</h3>
        </div>
        
        <div 
          onClick={() => setDutyModalOpen(true)}
          className={`status-toggle-switch-wrapper ${isOnline ? 'online' : 'offline'}`}
        >
          <div className="status-toggle-track">
            <span className="status-toggle-thumb"></span>
          </div>
          <span className="status-toggle-label-text">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Row stats */}
      <div className="status-card-stats">
        <div className="status-stat-item">
          <div className="status-stat-icon-wrapper primary">
            <FiAward />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Active Vehicle</span>
            <span className="status-stat-value">{user?.vehicleModel ? 'Swift Dzire' : 'Swift Dzire'}</span>
          </div>
        </div>

        <div className="status-stat-divider"></div>

        <div className="status-stat-item">
          <div className="status-stat-icon-wrapper primary">
            <FiActivity />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Acceptance</span>
            <span className="status-stat-value">{acceptanceRate}%</span>
          </div>
        </div>

        <div className="status-stat-divider"></div>

        <div className="status-stat-item">
          <div className="status-stat-icon-wrapper primary">
            <FiNavigation />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Trips Today</span>
            <span className="status-stat-value">{completedTripsCount}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
export default StatusCard
