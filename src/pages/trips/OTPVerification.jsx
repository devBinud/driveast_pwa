import React from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiLock, FiDelete, FiAlertCircle } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { Button } from '../../components/common/Button/Button'
import { Card } from '../../components/common/Card/Card'
import './OTPVerification.css'

export const OTPVerification = () => {
  const navigate = useNavigate()
  const { currentTrip, otpInput, otpError, setOtpInput, verifyOtp, startTrip } = useTripStore()

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  const handleKeyPress = (num) => {
    if (otpInput.length < 4) {
      setOtpInput(otpInput + num)
    }
  }

  const handleDelete = () => {
    setOtpInput(otpInput.slice(0, -1))
  }

  const handleVerify = () => {
    if (otpInput.length !== 4) return
    const verified = verifyOtp()
    if (verified) {
      startTrip() // Transition to active state
      navigate('/trips/active')
    }
  }

  return (
    <div className="page-container animate-fade-in otp-page">
      <div className="otp-header text-center">
        <div className="otp-icon-bg">
          <FiLock />
        </div>
        <h2>Verify OTP</h2>
        <p className="otp-desc">Ask the passenger for the 4-digit verification code to begin the trip.</p>
        
        {/* Test helper */}
        <div className="otp-test-hint">
          <span>Simulation Tip: Customer OTP is <strong>{currentTrip.otpCode}</strong> (or type <strong>1234</strong>)</span>
        </div>
      </div>

      {otpError && (
        <div className="otp-error-banner animate-fade-in">
          <FiAlertCircle />
          <span>{otpError}</span>
        </div>
      )}

      {/* Input cells display */}
      <div className="otp-display-cells">
        {Array.from({ length: 4 }).map((_, idx) => {
          const char = otpInput[idx] || ''
          return (
            <div key={idx} className={`otp-cell ${char ? 'filled' : ''} ${otpError ? 'error' : ''}`}>
              {char}
            </div>
          )
        })}
      </div>

      {/* Glassmorphic Custom Numpad */}
      <div className="numpad-container glass-panel">
        <div className="numpad-row">
          <button type="button" onClick={() => handleKeyPress('1')}>1</button>
          <button type="button" onClick={() => handleKeyPress('2')}>2</button>
          <button type="button" onClick={() => handleKeyPress('3')}>3</button>
        </div>
        <div className="numpad-row">
          <button type="button" onClick={() => handleKeyPress('4')}>4</button>
          <button type="button" onClick={() => handleKeyPress('5')}>5</button>
          <button type="button" onClick={() => handleKeyPress('6')}>6</button>
        </div>
        <div className="numpad-row">
          <button type="button" onClick={() => handleKeyPress('7')}>7</button>
          <button type="button" onClick={() => handleKeyPress('8')}>8</button>
          <button type="button" onClick={() => handleKeyPress('9')}>9</button>
        </div>
        <div className="numpad-row">
          <button type="button" className="empty-key" disabled></button>
          <button type="button" onClick={() => handleKeyPress('0')}>0</button>
          <button type="button" className="delete-key" onClick={handleDelete}>
            <FiDelete />
          </button>
        </div>
      </div>

      {/* Continue trigger */}
      <Button 
        variant="success" 
        onClick={handleVerify} 
        disabled={otpInput.length !== 4} 
        fullWidth
        size="lg"
      >
        Verify & Start Ride
      </Button>
    </div>
  )
}
export default OTPVerification
