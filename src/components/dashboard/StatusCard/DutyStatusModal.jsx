import React, { useState } from 'react'
import { FiWifi, FiWifiOff, FiCoffee, FiCalendar, FiLogOut, FiX, FiAlertCircle } from 'react-icons/fi'
import './DutyStatusModal.css'

export const DutyStatusModal = ({ isOnline, onGoOnline, onGoOffline, onClose }) => {
  const [selected, setSelected] = useState(null)

  const handleOption = (option) => {
    setSelected(option)
    if (option === 'online') {
      onGoOnline()
      setTimeout(onClose, 300)
    } else {
      onGoOffline()
      setTimeout(onClose, 300)
    }
  }

  return (
    <div className="duty-modal-backdrop" onClick={onClose}>
      <div className="duty-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="duty-modal-handle"></div>

        {/* Header */}
        <div className="duty-modal-header">
          <div>
            <p className="duty-modal-eyebrow">Duty Status</p>
            <h3 className="duty-modal-title">
              {isOnline ? 'You are Online & Active' : 'You are Offline'}
            </h3>
          </div>
          <button className="duty-modal-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <hr className="duty-modal-divider" />

        {/* Options */}
        <div className="duty-modal-options">

          {/* Go Online */}
          <button
            className={`duty-option-btn online-btn ${isOnline ? 'active-opt' : ''}`}
            onClick={() => handleOption('online')}
          >
            <div className="duty-opt-icon online-icon">
              <FiWifi />
            </div>
            <div className="duty-opt-text">
              <strong>Go Online</strong>
              <span>Start receiving ride requests</span>
            </div>
            {isOnline && <span className="duty-active-badge">Active</span>}
          </button>

          {/* Go Offline */}
          <button
            className={`duty-option-btn offline-btn ${!isOnline ? 'active-opt' : ''}`}
            onClick={() => handleOption('offline')}
          >
            <div className="duty-opt-icon offline-icon">
              <FiWifiOff />
            </div>
            <div className="duty-opt-text">
              <strong>Go Offline</strong>
              <span>Pause receiving new ride requests</span>
            </div>
            {!isOnline && <span className="duty-active-badge offline-badge">Active</span>}
          </button>

          <div className="duty-options-divider">
            <span>Other Options</span>
          </div>

          {/* Take a Break */}
          <button className="duty-option-btn neutral-btn" onClick={onClose}>
            <div className="duty-opt-icon break-icon">
              <FiCoffee />
            </div>
            <div className="duty-opt-text">
              <strong>Take a Break</strong>
              <span>Pause briefly, auto-resume in 30 mins</span>
            </div>
          </button>

          {/* On Leave */}
          <button className="duty-option-btn neutral-btn" onClick={onClose}>
            <div className="duty-opt-icon leave-icon">
              <FiCalendar />
            </div>
            <div className="duty-opt-text">
              <strong>Mark as On Leave</strong>
              <span>No requests for today</span>
            </div>
          </button>

          {/* Report Issue */}
          <button className="duty-option-btn neutral-btn danger-border" onClick={onClose}>
            <div className="duty-opt-icon issue-icon">
              <FiAlertCircle />
            </div>
            <div className="duty-opt-text">
              <strong>Report an Issue</strong>
              <span>Vehicle breakdown or emergency</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DutyStatusModal
