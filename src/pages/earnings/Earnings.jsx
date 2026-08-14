import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiTrendingUp, FiClock, FiCreditCard } from 'react-icons/fi'
import { FaIndianRupeeSign } from 'react-icons/fa6'
import { useDriverStatus } from '../../hooks/useDriverStatus'
import { useTripStore } from '../../store/tripStore'
import { Card } from '../../components/common/Card/Card'
import './Earnings.css'

const isSameLocalDay = (isoString) => {
  if (!isoString) return false
  const d = new Date(isoString)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
}

export const Earnings = () => {
  const navigate = useNavigate()
  const { todayEarnings, hoursOnline, completedTripsCount } = useDriverStatus()
  const { trips } = useTripStore()

  // "Today's Trip Earnings" below was filtering only by completed status, with
  // nothing checking the date at all -- despite the heading and variable name, it
  // showed every completed trip ever, not just today's. completedAtRaw (the real ISO
  // timestamp, not the pre-formatted display string) is what actually lets this be
  // filtered correctly.
  const todayTrips = trips.filter(
    (t) => String(t.status).toLowerCase() === 'completed' && isSameLocalDay(t.completedAtRaw)
  )

  // Calculate Cash vs UPI splits
  const cashTotal = todayTrips
    .filter(t => String(t.paymentMethod).toUpperCase() === 'CASH')
    .reduce((sum, t) => sum + (Number(t.fare) || 0), 0)

  const onlineTotal = todayTrips
    .filter(t => String(t.paymentMethod).toUpperCase() !== 'CASH')
    .reduce((sum, t) => sum + (Number(t.fare) || 0), 0)

  return (
    <div className="earnings-page page-container">
      {/* Header Row */}
      <div className="earnings-header">
        <button className="btn-back" onClick={() => navigate(-1)} aria-label="Go Back">
          <FiArrowLeft />
        </button>
        <div className="header-titles">
          <h2>Earnings & Collections</h2>
          <span className="subtitle">Track your daily income & cash flows</span>
        </div>
      </div>

      {/* Main earnings hero card */}
      <Card className="earnings-hero-card">
        <div className="hero-grid">
          <div className="hero-stat-block">
            <span className="hero-stat-lbl">Today's Total Earnings</span>
            <h1 className="hero-stat-val">₹{todayEarnings.toFixed(2)}</h1>
          </div>

          <div className="hero-summary-metrics">
            <div className="metric-box">
              <span className="metric-lbl">Trips Completed</span>
              <span className="metric-val">{completedTripsCount}</span>
            </div>
            <div className="metric-box">
              <span className="metric-lbl">Hours Online</span>
              <span className="metric-val">
                {hoursOnline} <span className="metric-unit">{hoursOnline === 1 ? 'hr' : 'hrs'}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Breakdown Cards */}
      <div className="earnings-breakdown-grid">
        <Card className="breakdown-card cash">
          <div className="breakdown-icon-wrapper">
            <FaIndianRupeeSign />
          </div>
          <div className="breakdown-details">
            <span className="breakdown-lbl">Cash Collections</span>
            <h3 className="breakdown-val text-success">₹{cashTotal.toFixed(2)}</h3>
            <span className="breakdown-desc">Collected directly from riders</span>
          </div>
        </Card>

        <Card className="breakdown-card online">
          <div className="breakdown-icon-wrapper">
            <FiCreditCard />
          </div>
          <div className="breakdown-details">
            <span className="breakdown-lbl">Online Settled</span>
            <h3 className="breakdown-val">₹{onlineTotal.toFixed(2)}</h3>
            <span className="breakdown-desc">Settled via UPI / Wallet</span>
          </div>
        </Card>
      </div>

      {/* Transactions Section */}
      <div className="transactions-section">
        <h3 className="section-heading">Today's Trip Earnings</h3>

        {todayTrips.length === 0 ? (
          <div className="empty-transactions glass-panel">
            <span className="empty-msg">No completed trips today yet. Go online to start earning!</span>
          </div>
        ) : (
          <div className="transaction-list">
            {todayTrips.map((trip) => {
              const isCash = String(trip.paymentMethod).toUpperCase() === 'CASH'
              return (
                <div key={trip.id} className="transaction-item glass-panel">
                  <div className="tx-header">
                    <span className="tx-id">{trip.id}</span>
                    <span className="tx-time">{trip.time || 'Today'}</span>
                  </div>

                  <div className="tx-route">
                    <div className="tx-address">
                      <span className="dot dot-pickup"></span>
                      <span className="addr-text">{trip.pickup}</span>
                    </div>
                    <div className="tx-address">
                      <span className="dot dot-drop"></span>
                      <span className="addr-text">{trip.drop}</span>
                    </div>
                  </div>

                  <div className="tx-footer">
                    <span className="tx-customer">Passenger: <strong>{trip.customerName}</strong></span>
                    <div className="tx-payment-group">
                      <span className={`tx-method-badge ${isCash ? 'cash-badge' : 'online-badge'}`}>
                        {trip.paymentMethod}
                      </span>
                      <span className="tx-amount">₹{Number(trip.fare || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Earnings
