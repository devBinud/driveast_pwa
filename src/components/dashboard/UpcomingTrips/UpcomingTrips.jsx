import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiNavigation, FiClock, FiWifiOff, FiCalendar, FiUser, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { useTripStore } from '../../../store/tripStore'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { Card } from '../../common/Card/Card'
import { Button } from '../../common/Button/Button'
import './UpcomingTrips.css'

export const UpcomingTrips = () => {
  const navigate = useNavigate()
  const upcomingTrips = useTripStore((state) => state.upcomingTrips)
  const isLoadingUpcoming = useTripStore((state) => state.isLoadingUpcoming)
  const upcomingTripsError = useTripStore((state) => state.upcomingTripsError)
  const fetchUpcomingTrips = useTripStore((state) => state.fetchUpcomingTrips)
  const { isOnline } = useDriverStatus()

  const handleViewDetails = (id) => {
    navigate(`/trips/upcoming/${id}`)
  }

  return (
    <div className="upcoming-trips-section">
      <div className="upcoming-trips-header">
        <h3 className="section-title">Upcoming Trips ({upcomingTrips.length})</h3>
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
              <FiWifiOff className="empty-icon" />
            </div>
            <h4>You Are Offline</h4>
            <p>Go online in the status panel to receive live dispatches and ride requests.</p>
          </div>
        </Card>
      ) : upcomingTripsError && upcomingTrips.length === 0 ? (
        // Distinct from the genuine "nothing scheduled" empty state below --
        // upcomingTripsError only gets set when the fetch itself failed (see
        // fetchUpcomingTrips in tripStore.js), so telling the driver there are
        // no scheduled trips here would be actively misleading: there might be
        // one, this screen just couldn't find out.
        <Card className="upcoming-empty-card" padding="lg">
          <div className="empty-card-content">
            <div className="empty-icon-wrapper danger-glow">
              <FiAlertCircle className="empty-icon" />
            </div>
            <h4>Couldn't Load Upcoming Trips</h4>
            <p>{upcomingTripsError}</p>
            <Button
              variant="secondary"
              size="sm"
              icon={FiRefreshCw}
              loading={isLoadingUpcoming}
              onClick={() => fetchUpcomingTrips()}
              className="upcoming-retry-btn"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : upcomingTrips.length === 0 ? (
        <Card className="upcoming-empty-card" padding="lg">
          <div className="empty-card-content">
            <div className="empty-icon-wrapper info-glow">
              <FiCalendar className="empty-icon" />
            </div>
            <h4>No Upcoming Scheduled Trips</h4>
            <p>You currently have no scheduled ride assignments from the server.</p>
          </div>
        </Card>
      ) : (
        <div className="upcoming-trips-list">
          {upcomingTrips.map((trip) => {
            const { id, pickup, drop, date, time, distance, duration, fare, customerName, customerAvatar } = trip
            return (
              <Card key={id} className="upcoming-trip-card" padding="none" onClick={() => handleViewDetails(id)}>
                <div className="upcoming-card-header">
                  <div className="customer-info-sec">
                    {customerAvatar ? (
                      <img src={customerAvatar} alt={customerName} className="customer-avatar-sm" />
                    ) : (
                      <div className="customer-avatar-sm-fallback"><FiUser /></div>
                    )}
                    <div>
                      <span className="customer-name-txt">{customerName || 'Lead Traveler'}</span>
                      <span className="trip-schedule-time">{date || 'Scheduled'} {time ? `• ${time}` : ''}</span>
                    </div>
                  </div>
                  <div className="fare-tag">
                    <span className="fare-val">₹{(Number(fare) || 0).toFixed(2)}</span>
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
                    {distance && (
                      <span className="meta-stat">
                        <FiNavigation /> {distance}
                      </span>
                    )}
                    {duration && (
                      <span className="meta-stat">
                        <FiClock /> {duration}
                      </span>
                    )}
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
