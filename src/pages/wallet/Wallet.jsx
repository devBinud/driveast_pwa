import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCreditCard, FiSliders, FiChevronDown, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useWalletStore } from '../../store/walletStore'
import { Card } from '../../components/common/Card/Card'
import { Button } from '../../components/common/Button/Button'
import { Loader } from '../../components/common/Loader/Loader'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import { SettlementPaymentModal } from '../../components/wallet/SettlementPaymentModal/SettlementPaymentModal'
import './Wallet.css'

const STATUS_META = {
  OUTSTANDING: { label: 'Outstanding', className: 'badge-warning' },
  PAYMENT_SUBMITTED: { label: 'Pending Verification', className: 'badge-info' },
  COLLECTED: { label: 'Settled', className: 'badge-success' },
  WAIVED: { label: 'Waived', className: 'badge-success' }
}

const SORT_OPTIONS = [
  { value: 'DATE_DESC', label: 'Newest First' },
  { value: 'DATE_ASC', label: 'Oldest First' },
  { value: 'AMOUNT_DESC', label: 'Highest Amount' },
  { value: 'AMOUNT_ASC', label: 'Lowest Amount' }
]

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const Wallet = () => {
  const navigate = useNavigate()
  const { summary, outstandingBookings, history, isLoading, isPaying, fetchAll, payBooking } = useWalletStore()

  const [activePayBooking, setActivePayBooking] = useState(null)
  const [historyFilter, setHistoryFilter] = useState('ALL') // 'ALL' | 'SETTLED' | 'OUTSTANDING' | 'PENDING'
  const [historySort, setHistorySort] = useState('DATE_DESC') // 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef(null)

  useEffect(() => {
    fetchAll()
  }, [])

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false)
      }
    }
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isSortOpen])

  const payableBookings = outstandingBookings.filter((b) => b.status === 'OUTSTANDING')

  const handlePayOutstandingClick = () => {
    if (payableBookings.length === 0) return
    setActivePayBooking(payableBookings[0])
  }

  const handleSubmitSettlement = async (bookingId, paymentMethod, remarks) => {
    try {
      await payBooking(bookingId, paymentMethod, remarks)
      toast.success('Payment submitted. Waiting for admin verification.')
      setActivePayBooking(null)
    } catch (err) {
      toast.error(err?.message || 'Failed to submit payment')
    }
  }

  // Calculate counts for filter chips
  const historyCounts = useMemo(() => {
    return {
      all: history.length,
      settled: history.filter((i) => i.status === 'COLLECTED' || i.status === 'WAIVED').length,
      outstanding: history.filter((i) => i.status === 'OUTSTANDING').length,
      pending: history.filter((i) => i.status === 'PAYMENT_SUBMITTED').length
    }
  }, [history])

  // Filter & sort history list
  const filteredHistory = useMemo(() => {
    let list = [...history]

    // Filter
    if (historyFilter === 'SETTLED') {
      list = list.filter((item) => item.status === 'COLLECTED' || item.status === 'WAIVED')
    } else if (historyFilter === 'OUTSTANDING') {
      list = list.filter((item) => item.status === 'OUTSTANDING')
    } else if (historyFilter === 'PENDING') {
      list = list.filter((item) => item.status === 'PAYMENT_SUBMITTED')
    }

    // Sort
    list.sort((a, b) => {
      const dateA = new Date(a.completedAt || 0).getTime()
      const dateB = new Date(b.completedAt || 0).getTime()
      const amtA = Number(a.cashCollected || 0)
      const amtB = Number(b.cashCollected || 0)

      switch (historySort) {
        case 'DATE_ASC':
          return dateA - dateB
        case 'AMOUNT_DESC':
          return amtB - amtA
        case 'AMOUNT_ASC':
          return amtA - amtB
        case 'DATE_DESC':
        default:
          return dateB - dateA
      }
    })

    return list
  }, [history, historyFilter, historySort])

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
                <Card key={b.id} className="wallet-item">
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
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => setActivePayBooking(b)}>
                        Pay
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Wallet history section */}
      <div className="wallet-section">
        <div className="wallet-section-header-row">
          <h3 className="section-heading">Wallet History</h3>
          
          {/* Custom Sleek Sort Dropdown */}
          <div className="wallet-sort-container" ref={sortRef}>
            <button
              type="button"
              className={`wallet-sort-trigger ${isSortOpen ? 'active' : ''}`}
              onClick={() => setIsSortOpen(!isSortOpen)}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <FiSliders className="sort-icon-left" />
              <span>{SORT_OPTIONS.find((opt) => opt.value === historySort)?.label || 'Sort'}</span>
              <FiChevronDown className={`sort-chevron ${isSortOpen ? 'open' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="wallet-sort-dropdown-menu" role="listbox">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={historySort === opt.value}
                    className={`wallet-sort-option ${historySort === opt.value ? 'selected' : ''}`}
                    onClick={() => {
                      setHistorySort(opt.value)
                      setIsSortOpen(false)
                    }}
                  >
                    <span>{opt.label}</span>
                    {historySort === opt.value && <FiCheck className="sort-check-icon" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="wallet-filter-pills-bar">
          <button
            type="button"
            className={`wallet-filter-pill ${historyFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setHistoryFilter('ALL')}
          >
            <span>All</span>
            <span className="filter-count-badge">{historyCounts.all}</span>
          </button>
          <button
            type="button"
            className={`wallet-filter-pill ${historyFilter === 'SETTLED' ? 'active' : ''}`}
            onClick={() => setHistoryFilter('SETTLED')}
          >
            <span>Settled</span>
            <span className="filter-count-badge">{historyCounts.settled}</span>
          </button>
          <button
            type="button"
            className={`wallet-filter-pill ${historyFilter === 'OUTSTANDING' ? 'active' : ''}`}
            onClick={() => setHistoryFilter('OUTSTANDING')}
          >
            <span>Outstanding</span>
            <span className="filter-count-badge">{historyCounts.outstanding}</span>
          </button>
          {historyCounts.pending > 0 && (
            <button
              type="button"
              className={`wallet-filter-pill ${historyFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setHistoryFilter('PENDING')}
            >
              <span>Pending</span>
              <span className="filter-count-badge info">{historyCounts.pending}</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <Loader type="skeleton" count={3} />
        ) : history.length === 0 ? (
          <EmptyState
            type="general"
            title="No Wallet Activity Yet"
            description="Your settled and submitted payments will appear here."
          />
        ) : filteredHistory.length === 0 ? (
          <div className="wallet-empty-filter glass-panel">
            <p>No {historyFilter.toLowerCase()} transactions found.</p>
            <button 
              type="button" 
              className="wallet-reset-filter-btn" 
              onClick={() => setHistoryFilter('ALL')}
            >
              Show All Transactions
            </button>
          </div>
        ) : (
          <div className="wallet-history-list">
            {filteredHistory.map((item) => {
              const statusMeta = STATUS_META[item.status] || { label: item.status, className: 'badge-info' }
              return (
                <div key={item.id} className="wallet-history-item glass-panel">
                  <div className="wallet-history-main">
                    <span className="wallet-history-date">{formatDate(item.completedAt)}</span>
                    <span className="wallet-history-booking">{item.bookingNumber}</span>
                  </div>
                  <div className="wallet-history-side">
                    <span className="wallet-history-amount">₹{Number(item.cashCollected || 0).toFixed(2)}</span>
                    <span className={`badge ${statusMeta.className}`}>{statusMeta.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <SettlementPaymentModal
        booking={activePayBooking}
        isSubmitting={isPaying}
        onClose={() => setActivePayBooking(null)}
        onSubmit={handleSubmitSettlement}
      />
    </div>
  )
}
export default Wallet

