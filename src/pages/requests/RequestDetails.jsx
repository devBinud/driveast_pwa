import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useRequestStore } from '../../store/requestStore'
import { useTripStore } from '../../store/tripStore'
import { RequestDetails as DetailsComponent } from '../../components/requests/RequestDetails/RequestDetails'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import './RequestDetails.css'

export const RequestDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const requests = useRequestStore((state) => state.requests)
  const declineRequest = useRequestStore((state) => state.declineRequest)
  const setAssignedTrip = useTripStore((state) => state.setAssignedTrip)

  const request = requests.find((req) => req.id === id)

  const handleAccept = () => {
    if (!request) return
    setAssignedTrip(request)
    declineRequest(request.id)
    navigate('/trips/assigned')
  }

  const handleDecline = () => {
    if (!request) return
    declineRequest(request.id)
    navigate('/requests')
  }

  return (
    <div className="req-details-page scroll-container">
      {/* Back Header */}
      <div className="req-details-back-header">
        <Link to="/requests" className="back-link-btn">
          <FiArrowLeft /> Back to Feed
        </Link>
        <span className="req-id-lbl">{id}</span>
      </div>

      {!request ? (
        <div style={{ padding: '24px' }}>
          <EmptyState
            title="Request Not Found"
            description="This ride request has expired or was accepted by another driver."
            actionLabel="Return to Feed"
            onActionClick={() => navigate('/requests')}
          />
        </div>
      ) : (
        <DetailsComponent
          request={request}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </div>
  )
}
export default RequestDetails
