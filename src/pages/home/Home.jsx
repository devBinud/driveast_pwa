import React from 'react'
import { Link } from 'react-router-dom'
import { FiChevronRight, FiNavigation } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useTripStore } from '../../store/tripStore'
import { StatusCard } from '../../components/dashboard/StatusCard/StatusCard'
import { StatsCard } from '../../components/dashboard/StatsCard/StatsCard'
import { UpcomingTrips } from '../../components/dashboard/UpcomingTrips/UpcomingTrips'
import './Home.css'

export const Home = () => {
  const { user } = useAuth()
  const currentTrip = useTripStore((state) => state.currentTrip)

  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good Morning'
    if (hr < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getActiveTripRoute = () => {
    if (!currentTrip) return '/trips'
    if (currentTrip.status === 'assigned' || currentTrip.status === 'arrived') {
      return '/trips/assigned'
    }
    if (currentTrip.status === 'otp_verified' || currentTrip.status === 'active') {
      return '/trips/active'
    }
    if (currentTrip.status === 'payment_pending') {
      return '/trips/payment'
    }
    return '/trips'
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Greetings Header */}
      <div className="home-greetings">
        <h2>
          <span className="greeting-light">{getGreeting()}, </span>
          <span className="greeting-bold">{user?.name.split(' ')[0] || 'Driver'}</span>
        </h2>
        <p className="greetings-sub">Drive safely and check your requests feed.</p>
      </div>

      {/* Active Trip Banner Alert if a trip is current */}
      {currentTrip && currentTrip.status !== 'completed' && (
        <Link to={getActiveTripRoute()} className="active-trip-banner-link">
          <div className="active-trip-banner pulse-glow-success">
            <div className="banner-icon-bg">
              <FiNavigation />
            </div>
            <div className="banner-details">
              <h4>Active Ride In Progress</h4>
              <p>To: {currentTrip.drop.split(',')[0]}</p>
            </div>
            <FiChevronRight className="banner-arrow" />
          </div>
        </Link>
      )}

      {/* Driver Status Toggle */}
      <StatusCard />

      {/* Analytics Stats */}
      <StatsCard />

      {/* Upcoming Trips List */}
      <UpcomingTrips />
    </div>
  )
}
export default Home
