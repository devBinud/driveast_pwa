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
            <div>
              <h4 className="active-trip-name">{customerName}</h4>
              {customerPhone && (
                <a 
                  href={`tel:${customerPhone}`}
                  style={{ 
                    color: 'var(--color-primary)', 
                    fontSize: '0.8rem', 
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    marginTop: '2px'
                  }}
                >
                  <FiPhone style={{ fontSize: '0.8rem' }} />
                  <span>{customerPhone}</span>
                </a>
              )}
            </div>
          </div>
          
          {showCustomerActions && (
            <div className="active-trip-cust-actions">
              <a href={`tel:${customerPhone}`} className="cust-action-btn-circle phone" title="Call Customer">
                <FiPhone />
              </a>
            </div>
          )}
        </div>

        {/* Route Details (Pickup & Dropoff) */}
        <div className="active-trip-route-details">
          <div className="active-trip-route-indicator">
            <span className="dot-p"></span>
            <span className="line-connect"></span>
            <span className="dot-d"></span>
          </div>
          
          <div className="active-trip-route-text">
            <div className="active-trip-route-item">
              <span className="active-trip-route-lbl">Pickup Location</span>
              <span className="active-trip-route-addr">{pickup}</span>
            </div>
            <div className="active-trip-route-item">
              <span className="active-trip-route-lbl">Dropoff Location</span>
              <span className="active-trip-route-addr">{drop}</span>
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
