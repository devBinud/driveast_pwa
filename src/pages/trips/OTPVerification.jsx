import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiLock, FiAlertCircle, FiActivity } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { Button } from '../../components/common/Button/Button'
import { Input } from '../../components/common/Input/Input'
import { OdometerPhotoCapture } from '../../components/trips/OdometerPhotoCapture/OdometerPhotoCapture'
import './OTPVerification.css'

export const OTPVerification = () => {
  const navigate = useNavigate()
  const { currentTrip, hasHydrated, otpInput, otpError, setOtpInput, verifyOtp, startTrip, isLoadingTrip } = useTripStore()
  const [startOdo, setStartOdo] = useState('45210')
  const [startOdoImageUrl, setStartOdoImageUrl] = useState(null)
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // See AssignedTrip.jsx: persisted trip state restores a tick after first
  // render, so this must wait for hydration before treating a null currentTrip
  // as "no trip" and redirecting away.
  if (!hasHydrated) {
    return null
  }

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

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

  const handleVerify = async () => {
    if (otpInput.length !== 4 || !startOdoImageUrl) return
    const verified = await verifyOtp(Number(startOdo) || 45210, startOdoImageUrl)
    if (verified) {
      startTrip()
      navigate('/trips/active')
    }
  }

  return (
    <div className="page-container animate-fade-in otp-page">
      <div className="otp-header text-center">
        <div className="otp-icon-bg">
          <FiLock />
        </div>
        <h2>Verify Guest OTP</h2>
        <p className="otp-desc">Enter passenger 4-digit code and vehicle initial odometer reading to begin trip.</p>
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

      {/* OTP Input cells display */}
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

      {/* Start Odometer Field */}
      <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
        <Input
          label="Start Odometer Reading (KM)"
          type="number"
          step="1"
          inputMode="numeric"
          placeholder="e.g. 45210"
          value={startOdo}
          onChange={(e) => setStartOdo(e.target.value)}
          icon={FiActivity}
          required
        />
      </div>

      <OdometerPhotoCapture
        label="Start Odometer Photo"
        imageUrl={startOdoImageUrl}
        onUploaded={setStartOdoImageUrl}
      />

      {/* Continue trigger */}
      <Button
        variant="success"
        onClick={handleVerify}
        disabled={otpInput.length !== 4 || !startOdo || !startOdoImageUrl}
        loading={isLoadingTrip}
        fullWidth
        size="lg"
      >
        Verify OTP & Start Ride
      </Button>
    </div>
  )
}
export default OTPVerification
