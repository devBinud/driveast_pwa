import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTripStore } from '../../store/tripStore'
import { PaymentCard } from '../../components/trips/PaymentCard/PaymentCard'
import './Payment.css'

export const Payment = () => {
  const navigate = useNavigate()
  const { currentTrip, hasHydrated, paymentMethod, setPaymentMethod, completeTrip, isLoadingTrip, tripError } = useTripStore()
  const [loading, setLoading] = useState(false)

  // See AssignedTrip.jsx: persisted trip state restores a tick after first
  // render, so this must wait for hydration before treating a null currentTrip
  // as "no trip" and redirecting away.
  if (!hasHydrated) {
    return null
  }

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleCollect = async (verifiedOnline = false) => {
    setLoading(true)
    try {
      // Executes Step 4 (collect-payment, skipped when verifiedOnline) & Step 5
      // (complete) APIs. completeTrip() already adds the finished trip into local
      // trip history itself (with the correct, backend-recalculated fare), so
      // today's earnings/trip count -- both now derived from that same trip list,
      // see useDriverStatus -- update automatically without a separate local
      // counter to keep in sync by hand.
      await completeTrip(verifiedOnline)
      navigate('/trips/completed')
    } catch (err) {
      toast.error(tripError || err?.message || 'Failed to collect payment. Please try again.')
    } finally {
      setLoading(false)
    }
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
