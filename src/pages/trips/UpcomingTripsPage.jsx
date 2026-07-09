import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiNavigation, FiClock, FiCalendar } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { Card } from '../../components/common/Card/Card'
import { Button } from '../../components/common/Button/Button'
import './UpcomingTripsPage.css'

export const UpcomingTripsPage = () => {
  const navigate = useNavigate()
  const upcomingTrips = useTripStore((state) => state.upcomingTrips)

  return (
    <div className="page-container animate-fade-in upcoming-page-container scroll-container">
      {/* Back Header */}
      <div className="upcoming-header-row">
        <Link to="/" className="back-link-btn">
          <FiArrowLeft /> Back to Home
        </Link>
        <div className="upcoming-header-title">
          <h2>Upcoming Bookings</h2>
          <p className="upcoming-sub-lbl">Your scheduled future trips (7-10 days later)</p>
        </div>
      </div>

      {upcomingTrips.length === 0 ? (
        <Card className="upcoming-empty-card" padding="lg">
          <div className="empty-card-content">
            <FiCalendar className="empty-icon" />
            <h4>No Scheduled Trips</h4>
            <p>You do not have any future scheduled bookings at this time.</p>
          </div>
        </Card>
      ) : (
        <div className="upcoming-trips-list">
          {upcomingTrips.map((trip) => {
            const { id, pickup, drop, date, time, distance, duration, fare, customerName, customerAvatar } = trip
            return (
              <Card 
                key={id} 
                className="upcoming-trip-card" 
                padding="none" 
                onClick={() => navigate(`/trips/upcoming/${id}`)}
              >
                <div className="upcoming-card-header">
                  <div className="customer-info-sec">
                    <img src={customerAvatar} alt={customerName} className="customer-avatar-sm" />
                    <div>
                      <span className="customer-name-txt">{customerName}</span>
                      <span className="trip-schedule-time">{date} • {time}</span>
                    </div>
                  </div>
                  <div className="fare-tag">
                    <span className="fare-val">₹{fare.toFixed(2)}</span>
                  </div>
                </div>

                <div className="upcoming-card-body">
                  <div className="trip-route-indicator">
                    <div className="dot-pickup"></div>
                    <div className="line-connect"></div>
                    <div className="dot-drop"></div>
                  </div>
                  <div className="trip-addresses">
                    <div className="address-block">
                      <span className="addr-label">Pickup</span>
                      <p className="addr-txt">{pickup}</p>
                    </div>
                    <div className="address-block">
                      <span className="addr-label">Dropoff</span>
                      <p className="addr-txt">{drop}</p>
                    </div>
                  </div>
                </div>

                <div className="upcoming-card-footer">
                  <div className="trip-meta-stats">
                    <span className="meta-stat">
                      <FiNavigation /> {distance}
                    </span>
                    <span className="meta-stat">
                      <FiClock /> {duration}
                    </span>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/trips/upcoming/${id}`)
                    }}
                    className="view-details-btn"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UpcomingTripsPage
