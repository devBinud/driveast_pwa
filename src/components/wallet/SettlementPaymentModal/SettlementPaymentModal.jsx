import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { FiSend, FiX } from 'react-icons/fi'
import './SettlementPaymentModal.css'

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI Transfer' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cash', label: 'Cash to Office' }
]

export const SettlementPaymentModal = ({ booking, isSubmitting, onClose, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [remarks, setRemarks] = useState('')

  if (!booking) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(booking.id, paymentMethod, remarks)
  }

  const modalContent = (
    <div className="settlement-modal-backdrop" onClick={onClose}>
      <div className="settlement-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="settlement-modal-handle"></div>

        {/* Header */}
        <div className="settlement-modal-header">
          <div>
            <p className="settlement-modal-eyebrow">Wallet</p>
            <h3 className="settlement-modal-title">Submit Settlement Payment</h3>
          </div>
          <button type="button" className="settlement-modal-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <hr className="settlement-modal-divider" />

        <div className="settlement-modal-info-box">
          <div>
            <p className="settlement-info-lbl">Booking Number</p>
            <p className="settlement-info-val">{booking.bookingNumber}</p>
          </div>
          <div className="settlement-info-right">
            <p className="settlement-info-lbl">Cash Collected</p>
            <p className="settlement-info-amount">₹{booking.cashCollected.toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settlement-modal-form">
          <div className="settlement-form-group">
            <label className="settlement-form-label">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="settlement-select"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="settlement-form-group">
            <label className="settlement-form-label">Remarks / Notes</label>
            <textarea
              placeholder="Optional notes or details..."
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="settlement-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="settlement-submit-btn"
          >
            <FiSend />
            {isSubmitting ? 'Submitting...' : 'Submit Settlement'}
          </button>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default SettlementPaymentModal

