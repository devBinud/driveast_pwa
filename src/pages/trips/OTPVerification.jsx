import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiLock, FiAlertCircle, FiActivity } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTripStore, getTripStatusRoute } from '../../store/tripStore'
import { Button } from '../../components/common/Button/Button'
import { Input } from '../../components/common/Input/Input'
import { OdometerPhotoCapture } from '../../components/trips/OdometerPhotoCapture/OdometerPhotoCapture'
import './OTPVerification.css'

export const OTPVerification = () => {
  const navigate = useNavigate()
  const { currentTrip, hasHydrated, syncCurrentTrip, otpInput, otpError, setOtpInput, verifyOtp, startTrip, isLoadingTrip } = useTripStore()
  // Starts empty: the driver must type the reading off the dashboard. A pre-filled sample
  // number here used to be submitted as the real start odometer if left untouched.
  const [startOdo, setStartOdo] = useState('')
  const [startOdoImageUrl, setStartOdoImageUrl] = useState(null)
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    syncCurrentTrip()
  }, [syncCurrentTrip])

  // See AssignedTrip.jsx: persisted trip state restores a tick after first
  // render, so this must wait for hydration before treating a null currentTrip
  // as "no trip" and redirecting away.
  if (!hasHydrated) {
    return null
  }

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  // See AssignedTrip.jsx's matching guard: syncCurrentTrip() may have just
  // corrected currentTrip.status from the backend (e.g. verify-otp actually
  // went through before the app was killed, even though the local state never
  // got the response). Forward the driver to wherever that real status says
  // they belong instead of leaving them on an OTP form for a trip that's
  // already moved on.
  const correctRoute = getTripStatusRoute(currentTrip.status)
  if (correctRoute && correctRoute !== '/trips/otp') {
    return <Navigate to={correctRoute} replace />
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
    // No fallback number: an unreadable/zero reading must be corrected by the driver, never
    // replaced by a made-up one (this used to fall back to a sample 45210).
    const startOdoValue = Number(startOdo)
    if (!Number.isFinite(startOdoValue) || startOdoValue <= 0) {
      toast.error('Please enter a valid starting odometer reading.')
      return
    }
    const verified = await verifyOtp(startOdoValue, startOdoImageUrl)
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
