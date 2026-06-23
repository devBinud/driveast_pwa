import React from 'react'
import { FiMapPin, FiNavigation, FiClock, FiStar, FiChevronRight } from 'react-icons/fi'
import { Card } from '../../common/Card/Card'
import { Button } from '../../common/Button/Button'
import './RequestCard.css'

export const RequestCard = ({
  request,
  onAccept,
  onDecline,
  onViewDetails
}) => {
  const {
    id,
    pickup,
    drop,
    distance,
    duration,
    fare,
    timeLeft,
    customerName,
    customerRating,
    customerAvatar
  } = request

  // Calculate percentage of timer remaining (initial full time is 60s for timer bar calculations)
  const timerPercentage = Math.min((timeLeft / 60) * 100, 100)

  return (
    <Card className="request-card pulse-glow-orange" padding="none">
      {/* Timer Bar */}
      <div className="request-timer-track">
        <div 
          className="request-timer-bar" 
          style={{ 
            width: `${timerPercentage}%`,
            background: timeLeft < 15 ? 'var(--color-danger)' : 'var(--color-warning)'
          }}
        ></div>
      </div>

      <div className="request-card-content">
        {/* Customer Header */}
        <div className="request-customer-header">
          <div className="request-cust-info">
            <img src={customerAvatar} alt={customerName} className="request-cust-avatar" />
            <div>
              <h4 className="request-cust-name">{customerName}</h4>
              <div className="request-cust-rating">
                <FiStar className="star-icon" />
                <span>{customerRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="request-fare-badge">
            <span className="request-fare-lbl">Fare</span>
            <span className="request-fare-amt">₹{fare.toFixed(2)}</span>
          </div>
        </div>

        {/* Route Details */}
        <div className="request-route-container" onClick={onViewDetails}>
          <div className="route-indicator-dots">
            <div className="dot-pickup"></div>
            <div className="line-between"></div>
            <div className="dot-drop"></div>
          </div>
          
          <div className="route-addresses">
            <div className="address-item">
              <span className="addr-lbl">Pickup</span>
              <p className="addr-text">{pickup}</p>
            </div>
            <div className="address-item">
              <span className="addr-lbl">Dropoff</span>
              <p className="addr-text">{drop}</p>
            </div>
          </div>
        </div>

        {/* Distance/Time stats */}
        <div className="request-route-stats">
          <div className="route-stat">
            <FiNavigation />
            <span>{distance}</span>
          </div>
          <div className="route-stat">
            <FiClock />
            <span>{duration}</span>
          </div>
          <div className="route-timer-text">
            <span>Expires in: <strong>{timeLeft}s</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="request-card-actions">
          <Button variant="secondary" className="btn-decline" onClick={onDecline}>
            Decline
          </Button>
          <Button variant="primary" className="btn-accept" onClick={onAccept}>
            Accept & Start
          </Button>
        </div>
      </div>
    </Card>
  )
}
export default RequestCard
