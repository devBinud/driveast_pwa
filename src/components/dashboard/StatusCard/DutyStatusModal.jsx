import React from 'react'
import { createPortal } from 'react-dom'
import { FiWifi, FiWifiOff, FiCoffee, FiCalendar, FiAlertCircle, FiX } from 'react-icons/fi'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { AvailabilityStatus } from '../../../services/driverService'
import { pushNotificationService } from '../../../services/pushNotificationService'
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
      osc.type = 'sine'
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.38)
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.38)
    } else {
      osc.type = 'triangle'
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28)
      osc.frequency.setValueAtTime(329.63, audioCtx.currentTime)
      osc.frequency.setValueAtTime(220.00, audioCtx.currentTime + 0.08)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.28)
    }
  } catch (error) {
    console.warn('Audio Context failed to initialize:', error)
  }
}

export const DutyStatusModal = ({ isOnline, onGoOnline, onGoOffline, onClose }) => {
  const { availabilityStatus, setStatus, isLoadingStatus } = useDriverStatus()

  const handleSetStatus = async (enumStatus) => {
    if (enumStatus === AvailabilityStatus.AVAILABLE) {
      playDutySound('online')
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        pushNotificationService.subscribe().catch(() => {})
      }
    } else {
      playDutySound('offline')
    }
    await setStatus(enumStatus)
    setTimeout(onClose, 300)
  }

  const getHeadingText = () => {
    switch (availabilityStatus) {
      case AvailabilityStatus.AVAILABLE:
        return 'You are Online & Active'
      case AvailabilityStatus.OFFLINE:
        return 'You are Offline'
      case AvailabilityStatus.TEMP_UNAVAILABLE:
        return 'You are Taking a Break'
      case AvailabilityStatus.ON_LEAVE:
        return 'You are On Leave'
      case AvailabilityStatus.ON_TRIP:
        return 'You are On Active Trip'
      default:
        return 'You are Online & Active'
    }
  }

  const modalContent = (
    <div className="duty-modal-backdrop" onClick={onClose}>
      <div className="duty-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="duty-modal-handle"></div>

        {/* Header */}
        <div className="duty-modal-header">
          <div>
            <p className="duty-modal-eyebrow">Duty Status</p>
            <h3 className="duty-modal-title">{getHeadingText()}</h3>
          </div>
          <button className="duty-modal-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <hr className="duty-modal-divider" />

        {/* Options */}
        <div className="duty-modal-options">

          {/* AVAILABLE */}
          <button
            className={`duty-option-btn online-btn ${availabilityStatus === AvailabilityStatus.AVAILABLE ? 'active-opt' : ''}`}
            onClick={() => handleSetStatus(AvailabilityStatus.AVAILABLE)}
            disabled={isLoadingStatus}
          >
            <div className="duty-opt-icon online-icon">
              <FiWifi />
            </div>
            <div className="duty-opt-text">
              <strong>Go Online</strong>
              <span>Start receiving new ride requests</span>
            </div>
            {availabilityStatus === AvailabilityStatus.AVAILABLE && <span className="duty-active-badge">Active</span>}
          </button>

          {/* OFFLINE */}
          <button
            className={`duty-option-btn offline-btn ${availabilityStatus === AvailabilityStatus.OFFLINE ? 'active-opt' : ''}`}
            onClick={() => handleSetStatus(AvailabilityStatus.OFFLINE)}
            disabled={isLoadingStatus}
          >
            <div className="duty-opt-icon offline-icon">
              <FiWifiOff />
            </div>
            <div className="duty-opt-text">
              <strong>Go Offline</strong>
              <span>Pause receiving new ride requests</span>
            </div>
            {availabilityStatus === AvailabilityStatus.OFFLINE && <span className="duty-active-badge offline-badge">Active</span>}
          </button>

          <div className="duty-options-divider">
            <span>Other Options</span>
          </div>

          {/* TEMP_UNAVAILABLE */}
          <button 
            className={`duty-option-btn neutral-btn ${availabilityStatus === AvailabilityStatus.TEMP_UNAVAILABLE ? 'active-opt' : ''}`} 
            onClick={() => handleSetStatus(AvailabilityStatus.TEMP_UNAVAILABLE)}
            disabled={isLoadingStatus}
          >
            <div className="duty-opt-icon break-icon">
              <FiCoffee />
            </div>
            <div className="duty-opt-text">
              <strong>Take a Break</strong>
              <span>Pause briefly, auto-resume in 30 mins</span>
            </div>
            {availabilityStatus === AvailabilityStatus.TEMP_UNAVAILABLE && <span className="duty-active-badge">Active</span>}
          </button>

          {/* ON_LEAVE */}
          <button 
            className={`duty-option-btn neutral-btn ${availabilityStatus === AvailabilityStatus.ON_LEAVE ? 'active-opt' : ''}`} 
            onClick={() => handleSetStatus(AvailabilityStatus.ON_LEAVE)}
            disabled={isLoadingStatus}
          >
            <div className="duty-opt-icon leave-icon">
              <FiCalendar />
            </div>
            <div className="duty-opt-text">
              <strong>Mark as On Leave</strong>
              <span>No requests for today</span>
            </div>
            {availabilityStatus === AvailabilityStatus.ON_LEAVE && <span className="duty-active-badge">Active</span>}
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

  return createPortal(modalContent, document.body)
}

export default DutyStatusModal

