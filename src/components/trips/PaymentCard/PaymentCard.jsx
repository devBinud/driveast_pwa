import React from 'react'
import { FiDollarSign, FiCheckCircle, FiInfo } from 'react-icons/fi'
import { Card } from '../../common/Card/Card'
import { Button } from '../../common/Button/Button'
import './PaymentCard.css'

export const PaymentCard = ({
  trip,
  paymentMethod,
  setPaymentMethod,
  onCollect,
  loading = false
}) => {
  const { fare, tripId } = trip

  return (
    <Card className="payment-card-panel" padding="md">
      <div className="payment-card-header">
        <span className="payment-trip-id">{tripId}</span>
        <h3>Collect Payment</h3>
      </div>

      <div className="payment-fare-showcase text-center">
        <span className="payment-fare-lbl">Collectable Amount</span>
        <h2 className="payment-fare-value">₹{fare.toFixed(2)}</h2>
      </div>

      {/* Payment methods selector */}
      <div className="payment-selector-container">
        <span className="selector-title">Select Payment Mode</span>
        <div className="payment-modes-grid">
          
          <button 
            type="button"
            className={`payment-mode-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('Cash')}
          >
            <span className="mode-circle"></span>
            <div className="mode-details">
              <strong>Cash Payment</strong>
              <span>Collect cash from customer</span>
            </div>
          </button>

          <button 
            type="button"
            className={`payment-mode-btn ${paymentMethod === 'Online Wallet' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('Online Wallet')}
          >
            <span className="mode-circle"></span>
            <div className="mode-details">
              <strong>Wallet / Card</strong>
              <span>Collect online wallet payment</span>
            </div>
          </button>

        </div>
      </div>

      {/* Info Warning */}
      <div className="payment-info-box">
        <FiInfo />
        <span>Please ask the customer to pay the exact amount. Do not complete the trip before receiving funds.</span>
      </div>

      {/* Action */}
      <Button 
        variant="success" 
        onClick={onCollect} 
        fullWidth 
        size="lg"
        loading={loading}
        icon={FiCheckCircle}
      >
        Confirm Payment Collected
      </Button>
    </Card>
  )
}
export default PaymentCard
