import React, { useEffect, useRef, useState } from 'react'
import { FiCheckCircle, FiInfo, FiCreditCard, FiLoader, FiRefreshCw, FiClock, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Card } from '../../common/Card/Card'
import { Button } from '../../common/Button/Button'
import { paymentService } from '../../../services/paymentService'
import './PaymentCard.css'

const POLL_INTERVAL_MS = 3000

export const PaymentCard = ({
  trip,
  paymentMethod,
  setPaymentMethod,
  onCollect,
  loading = false
}) => {
  const { fare, tripId } = trip

  // qrStatus: 'idle' | 'generating' | 'waiting' | 'expired'
  // (no 'success' state -- the instant the poll sees SUCCESS we hand off to
  // onCollect(true), which completes the trip and navigates away)
  const [qr, setQr] = useState(null)
  const [qrStatus, setQrStatus] = useState('idle')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const pollRef = useRef(null)
  const countdownRef = useRef(null)

  const clearTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    pollRef.current = null
    countdownRef.current = null
  }

  useEffect(() => clearTimers, [])

  const resetQR = () => {
    clearTimers()
    setQr(null)
    setQrStatus('idle')
  }

  const generateQR = async () => {
    resetQR()
    setQrStatus('generating')
    try {
      const res = await paymentService.createQR(trip.bookingId, trip.assignmentId || trip.id)
      const data = res?.data || res
      setQr(data)
      setQrStatus('waiting')

      const expiresAtMs = new Date(data.expires_at).getTime()
      setSecondsLeft(Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000)))

      countdownRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000))
        setSecondsLeft(remaining)
        if (remaining <= 0) {
          clearTimers()
          setQrStatus('expired')
        }
      }, 1000)

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await paymentService.getQRStatus(data.qr_code_id)
          const statusData = statusRes?.data || statusRes
          if (statusData?.status === 'SUCCESS') {
            clearTimers()
            onCollect(true)
          }
        } catch {
          // Transient poll failure -- keep polling, don't interrupt the guest mid-scan.
        }
      }, POLL_INTERVAL_MS)
    } catch (err) {
      setQrStatus('idle')
      toast.error(err?.message || 'Failed to generate QR code. Please try again.')
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <Card className="payment-card-panel" padding="md">
      <div className="payment-card-header">
        <span className="payment-trip-id">{tripId}</span>
        <h3>Collect Payment</h3>
      </div>

      <div className="payment-fare-showcase text-center">
        <span className="payment-fare-lbl">Collectable Amount</span>
        <h2 className="payment-fare-value">₹{Number(qr?.amount ?? fare).toFixed(2)}</h2>
      </div>

      {!qr && (
        <>
          {/* Payment methods selector */}
          <div className="payment-selector-container">
            <span className="selector-title">Select Payment Mode</span>
            <div className="payment-modes-grid">

              <button
                type="button"
                className={`payment-mode-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CASH')}
              >
                <span className="mode-circle"></span>
                <div className="mode-details">
                  <strong>Cash Payment</strong>
                  <span>Collect cash from customer</span>
                </div>
              </button>

              <button
                type="button"
                className={`payment-mode-btn ${paymentMethod === 'ONLINE' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('ONLINE')}
              >
                <span className="mode-circle"></span>
                <div className="mode-details">
                  <strong>Online</strong>
                  <span>Generate a UPI QR for the customer to scan</span>
                </div>
              </button>

            </div>
          </div>

          {/* Info Warning */}
          <div className="payment-info-box">
            <FiInfo />
            <span>Please ask the customer to pay the exact amount. Do not complete the trip before receiving funds.</span>
          </div>
        </>
      )}

      {/* Live QR code panel */}
      {qr && qrStatus !== 'expired' && (
        <div className="payment-qr-panel">
          <img src={qr.image_url} alt="Razorpay UPI QR Code" className="payment-qr-image" />
          <div className="payment-qr-footer">
            <p className="payment-qr-hint">Ask the customer to scan with any UPI app (GPay / PhonePe / Paytm)</p>
            <div className="payment-qr-status">
              <FiLoader className="spin" />
              <span>Waiting for payment…</span>
              <span className="payment-qr-timer"><FiClock /> {mm}:{ss}</span>
            </div>
            <button type="button" className="payment-qr-cancel" onClick={resetQR}>
              <FiX /> Cancel &amp; choose a different method
            </button>
          </div>
        </div>
      )}

      {qrStatus === 'expired' && (
        <div className="payment-qr-panel payment-qr-expired">
          <FiClock size={28} />
          <p>This QR code expired without payment.</p>
        </div>
      )}

      {/* Action */}
      {paymentMethod === 'CASH' && (
        <Button
          variant="success"
          onClick={() => onCollect()}
          fullWidth
          size="lg"
          loading={loading}
          icon={FiCheckCircle}
        >
          Confirm Payment Collected
        </Button>
      )}

      {paymentMethod === 'ONLINE' && !qr && (
        <Button
          variant="primary"
          onClick={generateQR}
          fullWidth
          size="lg"
          loading={qrStatus === 'generating'}
          icon={FiCreditCard}
        >
          Generate QR Code
        </Button>
      )}

      {paymentMethod === 'ONLINE' && qrStatus === 'expired' && (
        <Button
          variant="primary"
          onClick={generateQR}
          fullWidth
          size="lg"
          icon={FiRefreshCw}
        >
          Regenerate QR Code
        </Button>
      )}

      {paymentMethod === 'ONLINE' && qr && qrStatus === 'waiting' && loading && (
        <Button variant="success" fullWidth size="lg" loading icon={FiCheckCircle}>
          Payment Received — Completing Trip…
        </Button>
      )}
    </Card>
  )
}
export default PaymentCard
