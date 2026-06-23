import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useTripStore } from '../../store/tripStore'
import { useDriverStore } from '../../store/driverStore'
import { PaymentCard } from '../../components/trips/PaymentCard/PaymentCard'
import './Payment.css'

export const Payment = () => {
  const navigate = useNavigate()
  const { currentTrip, paymentMethod, setPaymentMethod, completeTrip } = useTripStore()
  const { addEarnings, incrementTrips } = useDriverStore()
  const [loading, setLoading] = useState(false)

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleCollect = () => {
    setLoading(true)
    setTimeout(() => {
      // Complete trip records in history
      completeTrip()
      
      // Update driver statistics in driverStore
      addEarnings(currentTrip.fare)
      incrementTrips()
      
      setLoading(false)
      navigate('/trips/completed')
    }, 1200)
  }

  return (
    <div className="page-container animate-fade-in payment-page-wrap">
      <PaymentCard
        trip={currentTrip}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onCollect={handleCollect}
        loading={loading}
      />
    </div>
  )
}
export default Payment
