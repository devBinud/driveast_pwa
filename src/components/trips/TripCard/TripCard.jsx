import React from 'react'
import { FiClock } from 'react-icons/fi'
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
    paymentMethod
  } = trip

  const isCancelled = status?.toLowerCase() === 'cancelled' || status?.toLowerCase() === 'canceled' || status?.toLowerCase() === 'rejected'

  return (
    <Card className="trip-card-item" padding="none">
      <div className="trip-card-header">
        <div className="trip-header-meta">
          <span className="trip-id-text">{id}</span>
          <span className="trip-time-text">{date}{time ? ` • ${time}` : ''}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="trip-card-route">
        <div className="trip-route-nodes">
          <span className="trip-node pickup"></span>
          <span className="trip-node-line"></span>
          <span className="trip-node drop"></span>
        </div>
        <div className="trip-route-addresses">
          <span className="trip-addr-txt">{pickup ? pickup.split(',')[0] : ''}</span>
          <span className="trip-addr-txt">{drop ? drop.split(',')[0] : ''}</span>
        </div>
      </div>

      <div className="trip-card-footer">
        <div className="trip-footer-stats">
          {(duration || distance) ? (
            <div className="trip-foot-stat">
              <FiClock />
              <span>{duration ? duration : ''}{distance ? ` (${distance})` : ''}</span>
            </div>
          ) : null}
          {paymentMethod && !isCancelled && (
            <span className="trip-pay-method">{paymentMethod}</span>
          )}
        </div>
        
        <div className="trip-card-fare">
          <span className="fare-sub">{isCancelled ? 'Cancelled' : 'Earned'}</span>
          <span className={`fare-amt-text ${isCancelled ? 'text-muted' : ''}`}>
            ₹{(isCancelled ? 0 : (fare || 0)).toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  )
}
export default TripCard
