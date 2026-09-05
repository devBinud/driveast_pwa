import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronRight, FiNavigation, FiX } from 'react-icons/fi'
import { FaIndianRupeeSign } from 'react-icons/fa6'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useTripStore, getTripStatusRoute } from '../../store/tripStore'
import { useWalletStore } from '../../store/walletStore'
import { StatusCard } from '../../components/dashboard/StatusCard/StatusCard'
import { UpcomingTrips } from '../../components/dashboard/UpcomingTrips/UpcomingTrips'
import { Card } from '../../components/common/Card/Card'
import './Home.css'

const ACTIVE_TRIP_STATUSES = [
  'assigned',
  'navigating',
  'arrived',
  'driver_arrived',
  'otp_verified',
  'active',
  'in_progress',
  'payment_pending'
]

export const Home = () => {
  const { user } = useAuth()
  const currentTrip = useTripStore((state) => state.currentTrip)
  const syncCurrentTrip = useTripStore((state) => state.syncCurrentTrip)
  const clearCurrentTrip = useTripStore((state) => state.clearCurrentTrip)
  // Populated centrally by MainLayout on login so the bottom-nav badge and this card
  // both stay in sync without each page re-fetching independently.
  const walletSummary = useWalletStore((state) => state.summary)

  // Reconcile with backend whenever Home is rendered
  useEffect(() => {
    syncCurrentTrip()
  }, [syncCurrentTrip])

  const tripStatus = (currentTrip?.status || '').toLowerCase()
  const isTripActive = Boolean(
    currentTrip &&
    tripStatus &&
    ACTIVE_TRIP_STATUSES.includes(tripStatus) &&
    !['cancelled', 'canceled', 'completed', 'rejected'].includes(tripStatus)
  )

  // If locally held trip is explicitly cancelled or completed, clean it up immediately
  useEffect(() => {
    if (currentTrip && !isTripActive) {
      clearCurrentTrip()
    }
  }, [currentTrip, isTripActive, clearCurrentTrip])

  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good Morning'
    if (hr < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getActiveTripRoute = () => getTripStatusRoute(tripStatus) || '/trips'

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

      {/* Active Trip Banner Alert if a trip is current and truly active */}
      {isTripActive && (
        <div className="active-trip-banner-container">
          <Link to={getActiveTripRoute()} className="active-trip-banner-link">
            <div className="active-trip-banner pulse-glow-success">
              <div className="banner-icon-bg">
                <FiNavigation />
              </div>
              <div className="banner-details">
                <h4>Active Ride In Progress</h4>
                <p>To: {currentTrip.drop ? currentTrip.drop.split(',')[0] : 'Destination'}</p>
              </div>
              <FiChevronRight className="banner-arrow" />
            </div>
          </Link>
          <button
            type="button"
            className="active-trip-dismiss-btn"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              clearCurrentTrip()
              toast('Active ride cleared', { icon: '🗑️' })
            }}
            title="Dismiss / Clear ride"
            aria-label="Dismiss ride"
          >
            <FiX />
          </button>
        </div>
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
