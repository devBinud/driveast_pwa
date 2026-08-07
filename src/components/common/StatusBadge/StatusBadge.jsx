import React from 'react'
import './StatusBadge.css'

export const StatusBadge = ({ status, hideDot = false }) => {
  const getBadgeClassAndText = () => {
    switch (status?.toLowerCase()) {
      case 'online':
        return { className: 'badge-success pulse-glow-success', text: 'Online', showDot: true }
      case 'offline':
        return { className: 'badge-danger', text: 'Offline', showDot: true }
      case 'assigned':
        return { className: 'badge-info', text: 'Assigned', showDot: true }
      case 'arrived':
        return { className: 'badge-warning', text: 'Arrived at Pickup', showDot: true }
      case 'otp_verified':
        return { className: 'badge-success', text: 'OTP Verified', showDot: true }
      case 'active':
        return { className: 'badge-info pulse-glow-success', text: 'Trip Started', showDot: true }
      case 'payment_pending':
        return { className: 'badge-warning pulse-glow-orange', text: 'Payment Pending', showDot: true }
      case 'completed':
        return { className: 'badge-success', text: 'Completed', showDot: true }
      case 'cancelled':
      case 'canceled':
      case 'rejected':
        return { className: 'badge-cancelled', text: 'CANCELLED', showDot: false }
      default:
        return { className: 'badge-info', text: status || 'Pending', showDot: true }
    }
  }

  const { className, text, showDot } = getBadgeClassAndText()

  return (
    <span className={`badge ${className}`}>
      {showDot && !hideDot && <span className="badge-dot"></span>}
      {text}
    </span>
  )
}
