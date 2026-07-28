import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useTripStore } from '../../store/tripStore'
import { useDriverStore } from '../../store/driverStore'
import { PaymentCard } from '../../components/trips/PaymentCard/PaymentCard'
import './Payment.css'

export const Payment = () => {
  const navigate = useNavigate()
  const { currentTrip, paymentMethod, setPaymentMethod, completeTrip, isLoadingTrip } = useTripStore()
  const { addEarnings, incrementTrips } = useDriverStore()
  const [loading, setLoading] = useState(false)

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleCollect = async () => {
    setLoading(true)
    // Executes Step 4 (collect-payment) & Step 5 (complete) APIs
    await completeTrip()
    
    // Update local driver stats
    addEarnings(currentTrip.fare || 3500.00)
    incrementTrips()
    
    setLoading(false)
    navigate('/trips/completed')
  }

  return (
    <div className="page-container animate-fade-in payment-page-wrap">
      <PaymentCard
        trip={currentTrip}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onCollect={handleCollect}
        loading={loading || isLoadingTrip}
      />
    </div>
  )
}
export default Payment
