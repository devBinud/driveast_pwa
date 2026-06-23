import React from 'react'
import './StatusBadge.css'

export const StatusBadge = ({ status }) => {
  const getBadgeClassAndText = () => {
    switch (status?.toLowerCase()) {
      case 'online':
        return { className: 'badge-success pulse-glow-success', text: 'Online' }
      case 'offline':
        return { className: 'badge-danger', text: 'Offline' }
      case 'assigned':
        return { className: 'badge-info', text: 'Assigned' }
      case 'arrived':
        return { className: 'badge-warning', text: 'Arrived at Pickup' }
      case 'otp_verified':
        return { className: 'badge-success', text: 'OTP Verified' }
      case 'active':
        return { className: 'badge-info pulse-glow-success', text: 'Trip Started' }
      case 'payment_pending':
        return { className: 'badge-warning pulse-glow-orange', text: 'Payment Pending' }
      case 'completed':
        return { className: 'badge-success', text: 'Completed' }
      default:
        return { className: 'badge-info', text: status || 'Pending' }
    }
  }

  const { className, text } = getBadgeClassAndText()

  return (
    <span className={`badge ${className}`}>
      <span className="badge-dot"></span>
      {text}
    </span>
  )
}
