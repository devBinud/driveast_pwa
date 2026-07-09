import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiTrendingUp, FiClock, FiCreditCard } from 'react-icons/fi'
import { useDriverStore } from '../../store/driverStore'
import { useTripStore } from '../../store/tripStore'
import { Card } from '../../components/common/Card/Card'
import './Earnings.css'

export const Earnings = () => {
  const navigate = useNavigate()
  const { todayEarnings, hoursOnline, completedTripsCount } = useDriverStore()
  const { trips } = useTripStore()

  // Dynamic calculations from trip history
  const todayDateString = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Filter completed trips completed today or fall back to mock trips to display a rich list
  const todayTrips = trips.filter(t => t.status === 'completed')

  // Calculate Cash vs UPI splits
  const cashTotal = todayTrips
    .filter(t => t.paymentMethod === 'Cash')
    .reduce((sum, t) => sum + t.fare, 0)

  const onlineTotal = todayTrips
    .filter(t => t.paymentMethod !== 'Cash')
    .reduce((sum, t) => sum + t.fare, 0)

  // Earnings Target calculation
  const dailyTarget = 1500
  const progressPercent = Math.min(Math.round((todayEarnings / dailyTarget) * 100), 100)

  return (
    <div className="earnings-page page-container scroll-container">
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
              <span className="metric-val">{hoursOnline}h</span>
            </div>
          </div>
        </div>

        {/* Daily Target Progress */}
        <div className="target-progress-container">
          <div className="target-progress-lbl">
            <span>Daily Target: <strong>₹{dailyTarget}</strong></span>
            <span>{progressPercent}% Achieved</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </Card>

      {/* Breakdown Cards */}
      <div className="earnings-breakdown-grid">
        <Card className="breakdown-card cash">
          <div className="breakdown-icon-wrapper">
            {/* <FiIndianRupee /> */}
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
              const isCash = trip.paymentMethod === 'Cash'
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
                      <span className="tx-amount">₹{trip.fare.toFixed(2)}</span>
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
