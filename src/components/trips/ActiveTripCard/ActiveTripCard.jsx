import React from 'react'
import { FiPhone, FiMessageSquare, FiMapPin, FiNavigation } from 'react-icons/fi'
import { Card } from '../../common/Card/Card'
import { Button } from '../../common/Button/Button'
import './ActiveTripCard.css'

export const ActiveTripCard = ({
  trip,
  onPrimaryAction,
  primaryActionLabel,
  loading = false,
  showCustomerActions = true
}) => {
  const {
    customerName,
    customerPhone,
    customerAvatar,
    customerRating,
    pickup,
    drop,
    status
  } = trip

  return (
    <Card className="active-trip-panel-card" padding="none">
      <div className="active-trip-panel-content">
        
        {/* Customer contact panel */}
        <div className="active-trip-cust-header">
          <div className="active-trip-cust-profile">
            <img src={customerAvatar} alt={customerName} className="active-trip-avatar" />
            <div>
              <h4 className="active-trip-name">{customerName}</h4>
              <span className="active-trip-rating">★ {customerRating.toFixed(1)} • Customer</span>
            </div>
          </div>
          
          {showCustomerActions && (
            <div className="active-trip-cust-actions">
              <a href={`tel:${customerPhone}`} className="cust-action-btn-circle phone" title="Call Customer">
                <FiPhone />
              </a>
              <button className="cust-action-btn-circle message" title="Chat with Customer">
                <FiMessageSquare />
              </button>
            </div>
          )}
        </div>

        {/* Status Address Details */}
        <div className="active-trip-addr-summary">
          <div className="active-trip-addr-lbl">
            <FiMapPin className={status === 'assigned' || status === 'arrived' ? 'text-success' : 'text-primary'} />
            <div className="addr-details-text">
              <span className="addr-lbl-text">
                {status === 'assigned' || status === 'arrived' ? 'Pickup Location' : 'Destination Address'}
              </span>
              <p className="addr-val-text">
                {status === 'assigned' || status === 'arrived' ? pickup : drop}
              </p>
            </div>
          </div>
        </div>

        {/* Action Panel Trigger */}
        <div className="active-trip-primary-action">
          <Button 
            variant={status === 'assigned' || status === 'arrived' ? 'primary' : 'success'} 
            onClick={onPrimaryAction} 
            fullWidth
            size="lg"
            loading={loading}
          >
            {primaryActionLabel}
          </Button>
        </div>

      </div>
    </Card>
  )
}
export default ActiveTripCard
