import React, { useState } from 'react'
import { FiWifi, FiWifiOff, FiCoffee, FiCalendar, FiLogOut, FiX, FiAlertCircle } from 'react-icons/fi'
import './DutyStatusModal.css'

const playDutySound = (type) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    
    const audioCtx = new AudioContextClass()
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    if (type === 'online') {
      // Pleasant upward double beep (Online indicator)
      osc.type = 'sine'
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.38)

      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12) // A5

      osc.start()
      osc.stop(audioCtx.currentTime + 0.38)
    } else if (type === 'offline') {
      // Short lower double beep (Offline indicator)
      osc.type = 'triangle'
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28)

      osc.frequency.setValueAtTime(329.63, audioCtx.currentTime) // E4
      osc.frequency.setValueAtTime(220.00, audioCtx.currentTime + 0.08) // A3

      osc.start()
      osc.stop(audioCtx.currentTime + 0.28)
    }
  } catch (error) {
    console.warn('Audio Context failed to initialize:', error)
  }
}

export const DutyStatusModal = ({ isOnline, onGoOnline, onGoOffline, onClose }) => {
  const [selected, setSelected] = useState(null)

  const handleOption = (option) => {
    setSelected(option)
    if (option === 'online') {
      playDutySound('online')
      onGoOnline()
      setTimeout(onClose, 300)
    } else {
      playDutySound('offline')
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
            disabled={isOnline}
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
            disabled={!isOnline}
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
