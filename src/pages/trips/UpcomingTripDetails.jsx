import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiPhone, FiStar, FiUser, FiInfo, FiTrash2 } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { Card } from '../../components/common/Card/Card'
import { Button } from '../../components/common/Button/Button'
import './UpcomingTripDetails.css'

export const UpcomingTripDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const upcomingTrips = useTripStore((state) => state.upcomingTrips)
  const trip = upcomingTrips.find((t) => t.id === id)

  if (!trip) {
    return (
      <div className="page-container animate-fade-in upcoming-details-container scroll-container">
        <div className="upcoming-header-row">
          <Link to="/trips/upcoming" className="back-link-btn">
            <FiArrowLeft /> Back to List
          </Link>
        </div>
        <Card className="upcoming-empty-card" padding="lg">
          <div className="empty-card-content">
            <FiInfo className="empty-icon" />
            <h4>Booking Not Found</h4>
            <p>This scheduled booking does not exist or has been cancelled.</p>
          </div>
        </Card>
      </div>
    )
  }

  const { pickup, drop, date, time, distance, duration, fare, customerName, customerRating, customerAvatar, customerPhone } = trip

  return (
    <div className="page-container animate-fade-in upcoming-details-container scroll-container">
      {/* Back Header */}
      <div className="upcoming-header-row">
        <Link to="/trips/upcoming" className="back-link-btn">
          <FiArrowLeft /> Back to List
        </Link>
        <div className="upcoming-details-title-row">
          <h2>Booking Details</h2>
          <span className="booking-id-tag">{id}</span>
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="booking-details-card" padding="lg">
        {/* Status Badge */}
        <div className="details-status-row">
          <span className="schedule-status-badge">Scheduled Trip</span>
          <span className="details-fare">₹{fare.toFixed(2)}</span>
        </div>

        {/* Date and Time Panel */}
        <div className="schedule-time-panel glass-panel">
          <div className="time-stat-item">
            <FiCalendar className="panel-icon orange" />
            <div>
              <span className="panel-stat-lbl">Scheduled Date</span>
              <p className="panel-stat-val">{date}</p>
            </div>
          </div>
          <div className="time-stat-divider"></div>
          <div className="time-stat-item">
            <FiClock className="panel-icon blue" />
            <div>
              <span className="panel-stat-lbl">Pickup Time</span>
              <p className="panel-stat-val">{time}</p>
            </div>
          </div>
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
                <p className="addr-val-txt">{pickup}</p>
              </div>
              <div className="address-item">
                <span className="addr-lbl">Dropoff Location</span>
                <p className="addr-val-txt">{drop}</p>
              </div>
            </div>
          </div>

          <div className="route-meta-grid">
            <div className="route-meta-item">
              <span className="meta-lbl">Estimated Distance</span>
              <p className="meta-val">{distance}</p>
            </div>
            <div className="route-meta-item">
              <span className="meta-lbl">Estimated Duration</span>
              <p className="meta-val">{duration}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="details-customer-section">
          <h4 className="details-sec-title">Rider Details</h4>
          <div className="customer-info-card glass-panel">
            <img src={customerAvatar} alt={customerName} className="details-cust-avatar" />
            <div className="customer-text-meta">
              <h5>{customerName}</h5>
              <div className="details-cust-rating">
                <FiStar className="star-icon" />
                <span>{customerRating.toFixed(1)} Rating</span>
              </div>
            </div>
            <a href={`tel:${customerPhone}`} className="call-cust-btn">
              <FiPhone />
            </a>
          </div>
        </div>

        {/* Information Notice */}
        <div className="booking-info-notice">
          <FiInfo className="info-icon" />
          <p>
            This trip is scheduled in advance. Please ensure you are online at least 15 minutes before the pickup time.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default UpcomingTripDetails
