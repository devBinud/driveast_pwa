import React from 'react'
import { FiCalendar, FiClock, FiDollarSign } from 'react-icons/fi'
import { Card } from '../../common/Card/Card'
import { StatusBadge } from '../../common/StatusBadge/StatusBadge'
import './TripCard.css'

export const TripCard = ({ trip }) => {
  const {
    id,
    pickup,
    drop,
    date,
    time,
    distance,
    duration,
    fare,
    status,
    paymentMethod,
    customerName
  } = trip

  return (
    <Card className="trip-card-item" padding="md">
      <div className="trip-card-header">
        <div className="trip-header-meta">
          <span className="trip-id-text">{id}</span>
          <span className="trip-time-text">{date} • {time}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="trip-card-route">
        <div className="trip-route-nodes">
          <span className="trip-node green"></span>
          <span className="trip-node-line"></span>
          <span className="trip-node indigo"></span>
        </div>
        <div className="trip-route-addresses">
          <span className="trip-addr-txt">{pickup.split(',')[0]}</span>
          <span className="trip-addr-txt">{drop.split(',')[0]}</span>
        </div>
      </div>

      <div className="trip-card-footer">
        <div className="trip-footer-stats">
          <div className="trip-foot-stat">
            <FiClock />
            <span>{duration} ({distance})</span>
          </div>
          {paymentMethod && (
            <span className="trip-pay-method">{paymentMethod}</span>
          )}
        </div>
        
        <div className="trip-card-fare">
          <span className="fare-sub">Earned</span>
          <span className="fare-amt-text">₹{fare.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  )
}
export default TripCard
