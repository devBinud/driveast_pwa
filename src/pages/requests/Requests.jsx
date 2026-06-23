import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequestStore } from '../../store/requestStore'
import { useTripStore } from '../../store/tripStore'
import { useDriverStatus } from '../../hooks/useDriverStatus'
import { RequestCard } from '../../components/requests/RequestCard/RequestCard'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import './Requests.css'

export const Requests = () => {
  const navigate = useNavigate()
  const { requests, declineRequest, tickTimers } = useRequestStore()
  const setAssignedTrip = useTripStore((state) => state.setAssignedTrip)
  const { isOnline } = useDriverStatus()

  // Start background countdown timer ticking
  useEffect(() => {
    const interval = setInterval(() => {
      tickTimers()
    }, 1000)

    return () => clearInterval(interval)
  }, [tickTimers])

  const handleAccept = (req) => {
    setAssignedTrip(req)
    declineRequest(req.id) // Remove from request queue
    navigate('/trips/assigned')
  }

  const handleDecline = (id) => {
    declineRequest(id)
  }

  const handleViewDetails = (id) => {
    navigate(`/requests/${id}`)
  }

  return (
    <div className="page-container animate-fade-in requests-page-container">
      <div className="requests-header-row">
        <div>
          <h2>Available Requests</h2>
          <p className="requests-sub">Real-time rider ride feed</p>
        </div>
      </div>

      {!isOnline ? (
        <EmptyState
          title="You Are Currently Offline"
          description="Go online using the toggle switch in the header or dashboard to begin receiving trip requests."
          type="general"
        />
      ) : requests.length === 0 ? (
        <EmptyState
          title="Waiting for Requests..."
          description="We will notify you immediately as soon as a new trip becomes available in your area."
          actionLabel="Simulate Incoming Request"
          onActionClick={addMockRequest}
          type="requests"
        />
      ) : (
        <div className="requests-list-container">
          <RequestCard
            key={requests[0].id}
            request={requests[0]}
            onAccept={() => handleAccept(requests[0])}
            onDecline={() => handleDecline(requests[0].id)}
            onViewDetails={() => handleViewDetails(requests[0].id)}
          />
        </div>
      )}
    </div>
  )
}
export default Requests
