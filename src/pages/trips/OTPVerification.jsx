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

  const inputRef = React.useRef(null)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    const cleanValue = value.replace(/\D/g, '').slice(0, 4)
    setOtpInput(cleanValue)
  }

  const handleCellClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
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

      {/* Hidden input to capture native keyboard events */}
      <input
        ref={inputRef}
        type="text"
        pattern="\d*"
        inputMode="numeric"
        maxLength={4}
        value={otpInput}
        onChange={handleInputChange}
        className="otp-hidden-input"
        autoFocus
      />

      {/* Input cells display */}
      <div className="otp-display-cells" onClick={handleCellClick} style={{ cursor: 'text' }}>
        {Array.from({ length: 4 }).map((_, idx) => {
          const char = otpInput[idx] || ''
          const isActive = otpInput.length === idx
          return (
            <div 
              key={idx} 
              className={`otp-cell ${char ? 'filled' : ''} ${isActive ? 'active' : ''} ${otpError ? 'error' : ''}`}
            >
              {char}
            </div>
          )
        })}
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
