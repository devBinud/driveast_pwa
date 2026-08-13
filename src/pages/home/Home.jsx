import React from 'react'
import { Link } from 'react-router-dom'
import { FiChevronRight, FiNavigation } from 'react-icons/fi'
import { FaIndianRupeeSign } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { useTripStore } from '../../store/tripStore'
import { useWalletStore } from '../../store/walletStore'
import { StatusCard } from '../../components/dashboard/StatusCard/StatusCard'
import { UpcomingTrips } from '../../components/dashboard/UpcomingTrips/UpcomingTrips'
import { Card } from '../../components/common/Card/Card'
import './Home.css'

export const Home = () => {
  const { user } = useAuth()
  const currentTrip = useTripStore((state) => state.currentTrip)
  // Populated centrally by MainLayout on login so the bottom-nav badge and this card
  // both stay in sync without each page re-fetching independently.
  const walletSummary = useWalletStore((state) => state.summary)

  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good Morning'
    if (hr < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getActiveTripRoute = () => {
    if (!currentTrip) return '/trips'
    if (currentTrip.status === 'assigned' || currentTrip.status === 'navigating' || currentTrip.status === 'arrived') {
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

      {/* Wallet Quick Access */}
      <Link to="/wallet" className="wallet-quick-link">
        <Card interactive className="wallet-quick-card">
          <div className={`wallet-quick-icon ${walletSummary.outstandingAmount > 0 ? 'due' : 'clear'}`}>
            <FaIndianRupeeSign />
          </div>
          <div className="wallet-quick-info">
            <span className="wallet-quick-label">
              {walletSummary.outstandingAmount > 0 ? 'Outstanding to Admin' : 'Wallet & Settlements'}
            </span>
            <span className="wallet-quick-value">
              {walletSummary.outstandingAmount > 0
                ? `₹${walletSummary.outstandingAmount.toFixed(2)}`
                : 'All settled up'}
            </span>
          </div>
          <FiChevronRight className="wallet-quick-arrow" />
        </Card>
      </Link>

      {/* Upcoming Trips List */}
      <UpcomingTrips />
    </div>
  )
}
export default Home
