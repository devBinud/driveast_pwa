import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCreditCard, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useWalletStore } from '../../store/walletStore'
import { Card } from '../../components/common/Card/Card'
import { Button } from '../../components/common/Button/Button'
import { Loader } from '../../components/common/Loader/Loader'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import './Wallet.css'

const STATUS_META = {
  OUTSTANDING: { label: 'Outstanding', className: 'badge-warning' },
  PAYMENT_SUBMITTED: { label: 'Pending Verification', className: 'badge-info' },
  COLLECTED: { label: 'Settled', className: 'badge-success' },
  WAIVED: { label: 'Waived', className: 'badge-success' }
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const Wallet = () => {
  const navigate = useNavigate()
  const { summary, outstandingBookings, history, isLoading, isPaying, fetchAll, payBooking } = useWalletStore()

  const [payingBookingId, setPayingBookingId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  useEffect(() => {
    fetchAll()
  }, [])

  const openPayFlow = (bookingId) => {
    setPayingBookingId(bookingId)
    setPaymentMethod('CASH')
  }

  const handleConfirmPay = async (bookingId) => {
    try {
      await payBooking(bookingId, paymentMethod)
      toast.success('Payment submitted. Waiting for admin verification.')
      setPayingBookingId(null)
    } catch (err) {
      toast.error(err?.message || 'Failed to submit payment')
    }
  }

  const payableBookings = outstandingBookings.filter((b) => b.status === 'OUTSTANDING')

  const handlePayOutstandingClick = () => {
    if (payableBookings.length === 0) return
    const target = payableBookings[0]
    openPayFlow(target.id)
    setTimeout(() => {
      document.getElementById(`wallet-booking-${target.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  return (
    <div className="wallet-page page-container animate-fade-in">
      {/* Header */}
      <div className="wallet-header">
        <button className="btn-back" onClick={() => navigate(-1)} aria-label="Go Back">
          <FiArrowLeft />
        </button>
        <div className="header-titles">
          <h2>Wallet & Settlements</h2>
          <span className="subtitle">Cash owed to admin & payment history</span>
        </div>
      </div>

      {/* Hero card */}
      <Card className="wallet-hero-card">
        <div className="wallet-hero-top">
          <span className="hero-stat-lbl">Outstanding to Admin</span>
          <h1 className="hero-stat-val">₹{summary.outstandingAmount.toFixed(2)}</h1>
        </div>

        <div className="wallet-hero-metrics">
          <div className="metric-box">
            <span className="metric-lbl">Unsettled Rides</span>
            <span className="metric-val">{summary.outstandingBookingsCount} Bookings</span>
          </div>
          <div className="metric-box">
            <span className="metric-lbl">Last Settlement</span>
            <span className="metric-val">{summary.lastSettlementDate ? formatDate(summary.lastSettlementDate) : '-'}</span>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={FiCreditCard}
          disabled={payableBookings.length === 0}
          onClick={handlePayOutstandingClick}
        >
          Pay Outstanding
        </Button>
      </Card>

      {/* Outstanding bookings section */}
      <div className="wallet-section">
        <h3 className="section-heading">Outstanding Bookings ({outstandingBookings.length})</h3>

        {isLoading ? (
          <Loader type="skeleton" count={2} />
        ) : outstandingBookings.length === 0 ? (
          <div className="empty-transactions glass-panel">
            <span className="empty-msg">No outstanding cash right now. You're all settled up!</span>
          </div>
        ) : (
          <div className="wallet-list">
            {outstandingBookings.map((b) => {
              const statusMeta = STATUS_META[b.status] || { label: b.status, className: 'badge-info' }
              const isPending = b.status === 'PAYMENT_SUBMITTED'
              return (
                <Card key={b.id} id={`wallet-booking-${b.id}`} className="wallet-item">
                  <div className="wallet-item-header">
                    <span className="wallet-item-id">{b.bookingNumber}</span>
                    <span className={`badge ${statusMeta.className}`}>{statusMeta.label}</span>
                  </div>

                  <div className="wallet-item-rows">
                    <div className="wallet-item-row">
                      <span className="info-lbl">Guest</span>
                      <span className="profile-row-val">{b.customerName}</span>
                    </div>
                    <div className="wallet-item-row">
                      <span className="info-lbl">Pickup</span>
                      <span className="profile-row-val">{b.pickup || '-'}</span>
                    </div>
                    <div className="wallet-item-row">
                      <span className="info-lbl">Drop</span>
                      <span className="profile-row-val">{b.drop || '-'}</span>
                    </div>
                    <div className="wallet-item-row">
                      <span className="info-lbl">Completed</span>
                      <span className="profile-row-val">{formatDate(b.completedAt)}</span>
                    </div>
                  </div>

                  <div className="wallet-item-footer">
                    <div className="wallet-cash-block">
                      <span className="info-lbl">Cash Collected</span>
                      <span className="wallet-cash-amount">₹{b.cashCollected.toFixed(2)}</span>
                    </div>

                    {isPending ? (
                      <span className="badge badge-info">Awaiting Verification</span>
                    ) : payingBookingId !== b.id ? (
                      <Button variant="primary" size="sm" onClick={() => openPayFlow(b.id)}>
                        Pay
                      </Button>
                    ) : null}
                  </div>

                  {payingBookingId === b.id && !isPending && (
                    <div className="wallet-pay-flow">
                      <span className="info-lbl">Select Payment Method</span>
                      <div className="wallet-method-toggle">
                        <button
                          type="button"
                          className={`method-chip ${paymentMethod === 'CASH' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('CASH')}
                        >
                          Cash
                        </button>
                        <button
                          type="button"
                          className={`method-chip ${paymentMethod === 'ONLINE' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('ONLINE')}
                        >
                          Online
                        </button>
                      </div>
                      <div className="wallet-pay-actions">
                        <Button variant="secondary" size="sm" onClick={() => setPayingBookingId(null)}>
                          Cancel
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          loading={isPaying}
                          icon={FiCheckCircle}
                          onClick={() => handleConfirmPay(b.id)}
                        >
                          Confirm Payment
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Wallet history section */}
      <div className="wallet-section">
        <h3 className="section-heading">Wallet History</h3>

        {isLoading ? (
          <Loader type="skeleton" count={3} />
        ) : history.length === 0 ? (
          <EmptyState
            type="general"
            title="No Wallet Activity Yet"
            description="Your settled and submitted payments will appear here."
          />
        ) : (
          <div className="wallet-history-list">
            {history.map((item) => {
              const statusMeta = STATUS_META[item.status] || { label: item.status, className: 'badge-info' }
              return (
                <div key={item.id} className="wallet-history-item glass-panel">
                  <div className="wallet-history-main">
                    <span className="wallet-history-date">{formatDate(item.completedAt)}</span>
                    <span className="wallet-history-booking">{item.bookingNumber}</span>
                  </div>
                  <div className="wallet-history-side">
                    <span className="wallet-history-amount">₹{item.cashCollected.toFixed(2)}</span>
                    <span className={`badge ${statusMeta.className}`}>{statusMeta.label}</span>
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
export default Wallet
