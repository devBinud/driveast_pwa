import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiPhone, FiInfo, FiActivity, FiCheckCircle } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { Card } from '../../components/common/Card/Card'
import { StatusBadge } from '../../components/common/StatusBadge/StatusBadge'
import './UpcomingTripDetails.css'
import './TripDetails.css'

export const TripDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedTripDetails: trip, fetchTripDetails, isLoadingTrip } = useTripStore()

  useEffect(() => {
    if (id) fetchTripDetails(id)
  }, [id])

  const formatDateTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (isLoadingTrip && !trip) {
    return (
      <div className="page-container animate-fade-in upcoming-details-container">
        <p className="trip-details-loading">Loading trip details...</p>
      </div>
    )
  }

  if (!trip || trip.assignmentId !== id) {
    return (
      <div className="page-container animate-fade-in upcoming-details-container">
        <div className="upcoming-header-row">
          <Link to="/trips" className="back-link-btn">
            <FiArrowLeft /> Back to History
          </Link>
        </div>
        <Card className="upcoming-empty-card" padding="lg">
          <div className="empty-card-content">
            <FiInfo className="empty-icon" />
            <h4>Trip Not Found</h4>
            <p>This trip's details could not be loaded.</p>
          </div>
        </Card>
      </div>
    )
  }

  const {
    bookingNumber, pickup, drop, fare, totalPaid, status, customerName, customerPhone,
    startOdometer, startOdometerImageUrl, endOdometer, endOdometerImageUrl, distanceKm,
    arrivedAt, startedAt, completedAt, paymentMethod
  } = trip

  return (
    <div className="page-container animate-fade-in upcoming-details-container">
      <div className="upcoming-header-row">
        <Link to="/trips" className="back-link-btn">
          <FiArrowLeft /> Back to History
        </Link>
        <div className="upcoming-details-title-row">
          <h2>Trip Details</h2>
          <span className="booking-id-tag">{bookingNumber}</span>
        </div>
      </div>

      <Card className="booking-details-card" padding="lg">
        <div className="details-status-row">
          <StatusBadge status={status} />
          <span className="details-fare">₹{Number(fare || 0).toFixed(2)}</span>
        </div>

        {/* Route Section */}
        <div className="details-route-section">
          <h4 className="details-sec-title">Route Information</h4>
          <div className="route-indicator-container">
            <div className="indicator-col">
              <div className="indicator-node pickup-node"></div>
              <div className="indicator-dashed-line"></div>
              <div className="indicator-node drop-node"></div>
            </div>
            <div className="addresses-col">
              <div className="address-item">
                <span className="addr-lbl">Pickup Location</span>
                <p className="addr-val-txt">{pickup || '—'}</p>
              </div>
              <div className="address-item">
                <span className="addr-lbl">Dropoff Location</span>
                <p className="addr-val-txt">{drop || '—'}</p>
              </div>
            </div>
          </div>

          <div className="route-meta-grid">
            <div className="route-meta-item">
              <span className="meta-lbl">Distance Travelled</span>
              <p className="meta-val">{distanceKm != null ? `${distanceKm} km` : '—'}</p>
            </div>
            <div className="route-meta-item">
              <span className="meta-lbl">Payment Method</span>
              <p className="meta-val">{paymentMethod || '—'}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="details-route-section">
          <h4 className="details-sec-title">Trip Timeline</h4>
          <div className="trip-timeline-list">
            <div className="trip-timeline-item">
              <FiCheckCircle className="timeline-icon" />
              <div>
                <span className="meta-lbl">Arrived at Pickup</span>
                <p className="meta-val">{formatDateTime(arrivedAt)}</p>
              </div>
            </div>
            <div className="trip-timeline-item">
              <FiCheckCircle className="timeline-icon" />
              <div>
                <span className="meta-lbl">Trip Started</span>
                <p className="meta-val">{formatDateTime(startedAt)}</p>
              </div>
            </div>
            <div className="trip-timeline-item">
              <FiCheckCircle className="timeline-icon" />
              <div>
                <span className="meta-lbl">Trip Completed</span>
                <p className="meta-val">{formatDateTime(completedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Odometer Records */}
        <div className="details-route-section">
          <h4 className="details-sec-title">Odometer Records</h4>
          <div className="odometer-records-grid">
            <div className="odometer-record-item">
              <span className="meta-lbl">Starting Odometer</span>
              <p className="meta-val"><FiActivity /> {startOdometer != null ? `${startOdometer} km` : '—'}</p>
              {startOdometerImageUrl && (
                <img src={startOdometerImageUrl} alt="Starting odometer" className="odometer-record-photo" />
              )}
            </div>
            <div className="odometer-record-item">
              <span className="meta-lbl">Ending Odometer</span>
              <p className="meta-val"><FiActivity /> {endOdometer != null ? `${endOdometer} km` : '—'}</p>
              {endOdometerImageUrl && (
                <img src={endOdometerImageUrl} alt="Ending odometer" className="odometer-record-photo" />
              )}
            </div>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="details-route-section">
          <h4 className="details-sec-title">Fare Summary</h4>
          <div className="route-meta-grid">
            <div className="route-meta-item">
              <span className="meta-lbl">Total Fare</span>
              <p className="meta-val">₹{Number(fare || 0).toFixed(2)}</p>
            </div>
            <div className="route-meta-item">
              <span className="meta-lbl">Amount Paid</span>
              <p className="meta-val">₹{Number(totalPaid || fare || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        {(customerName || customerPhone) && (
          <div className="details-customer-section">
            <h4 className="details-sec-title">Rider Details</h4>
            <div className="customer-info-card glass-panel">
              <div className="customer-text-meta">
                <h5>{customerName || 'Guest'}</h5>
              </div>
              {customerPhone && (
                <a href={`tel:${customerPhone}`} className="call-cust-btn">
                  <FiPhone />
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default TripDetails
