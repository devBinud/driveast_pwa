import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiNavigation, FiClock, FiStar, FiAlertCircle, FiCalendar } from 'react-icons/fi'
import { useTripStore } from '../../../store/tripStore'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { Card } from '../../common/Card/Card'
import { Button } from '../../common/Button/Button'
import './UpcomingTrips.css'

export const UpcomingTrips = () => {
  const navigate = useNavigate()
  const upcomingTrips = useTripStore((state) => state.upcomingTrips)
  const { isOnline } = useDriverStatus()

  const handleViewDetails = (id) => {
    navigate(`/trips/upcoming/${id}`)
  }

  return (
    <div className="upcoming-trips-section">
      <div className="upcoming-trips-header">
        <h3 className="section-title">Upcoming Trips</h3>
        {isOnline && upcomingTrips.length > 0 && (
          <span 
            className="view-all-trips-link" 
            onClick={() => navigate('/trips/upcoming')}
          >
            All Upcoming Trips
          </span>
        )}
      </div>

      {!isOnline ? (
        <Card className="upcoming-empty-card" padding="lg">
          <div className="empty-card-content">
            <div className="empty-icon-wrapper offline-glow">
              <FiAlertCircle className="empty-icon" />
            </div>
            <h4>You Are Offline</h4>
            <p>Go online in the header panel to see real-time rider trip requests.</p>
          </div>
        </Card>
      ) : upcomingTrips.length === 0 ? (
        <Card className="upcoming-empty-card" padding="lg">
          <div className="empty-card-content">
            <div className="empty-icon-wrapper info-glow">
              <FiCalendar className="empty-icon" />
            </div>
            <h4>No Upcoming Trips</h4>
            <p>You have no scheduled bookings at this time.</p>
          </div>
        </Card>
      ) : (
        <div className="upcoming-trips-list">
          {upcomingTrips.map((trip) => {
            const { id, pickup, drop, date, time, distance, duration, fare, customerName, customerRating, customerAvatar } = trip
            return (
              <Card key={id} className="upcoming-trip-card" padding="none" onClick={() => handleViewDetails(id)}>
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
                      handleViewDetails(id)
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

export default UpcomingTrips
