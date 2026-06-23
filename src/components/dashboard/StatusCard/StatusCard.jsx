import React from 'react'
import { FiPower, FiClock, FiActivity } from 'react-icons/fi'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { Card } from '../../common/Card/Card'
import './StatusCard.css'

export const StatusCard = () => {
  const { isOnline, toggleOnline, hoursOnline, acceptanceRate } = useDriverStatus()

  return (
    <Card className={`status-card ${isOnline ? 'online' : 'offline'}`} padding="none">
      <div className="status-card-header">
        <div className="status-meta">
          <span className="status-title-label">Duty Status</span>
          <h3 className="status-text-heading">{isOnline ? 'Online & Active' : 'Offline'}</h3>
        </div>
        <button 
          onClick={toggleOnline} 
          className={`status-toggle-btn ${isOnline ? 'active' : ''}`}
          aria-label={isOnline ? 'Go Offline' : 'Go Online'}
        >
          <FiPower />
        </button>
      </div>

      <div className="status-card-stats">
        <div className="status-stat-item">
          <div className="status-stat-icon-wrapper purple">
            <FiClock />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Shift Duration</span>
            <span className="status-stat-value">{isOnline ? `${hoursOnline} hrs` : '0.0 hrs'}</span>
          </div>
        </div>

        <div className="status-stat-divider"></div>

        <div className="status-stat-item">
          <div className="status-stat-icon-wrapper green">
            <FiActivity />
          </div>
          <div className="status-stat-info">
            <span className="status-stat-label">Acceptance Rate</span>
            <span className="status-stat-value">{acceptanceRate}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
export default StatusCard
