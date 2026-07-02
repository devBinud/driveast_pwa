import React, { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useRequestStore } from '../store/requestStore'
import { useTripStore } from '../store/tripStore'
import { useDriverStore } from '../store/driverStore'

export const useNotifications = () => {
  const requests = useRequestStore((state) => state.requests)
  const currentTrip = useTripStore((state) => state.currentTrip)
  const isOnline = useDriverStore((state) => state.isOnline)
  const lastNotifiedId = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Custom toast notification style helper
  const showToastNotification = (title, message, type = 'info') => {
    toast.custom((t) => (
      <div
        onClick={() => {
          toast.dismiss(t.id)
          navigate('/requests')
        }}
        className={`glass-panel animate-fade-in ${
          t.visible ? 'active' : ''
        }`}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          minWidth: '290px',
          maxWidth: '92vw',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.3s ease',
          userSelect: 'none'
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          flexShrink: 0
        }}>
          🔔
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.825rem', lineHeight: 1.2 }}>
            {title}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.725rem', marginTop: '2px', lineHeight: 1.2 }}>
            {message}
          </span>
        </div>
      </div>
    ), { duration: 4000 })
  }

  // Trigger notification when requests length changes
  useEffect(() => {
    if (requests.length > 0) {
      const latestReq = requests[0]
      if (lastNotifiedId.current === latestReq.id) return
      lastNotifiedId.current = latestReq.id

      // Play a subtle notification sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav')
        audio.volume = 0.3
        audio.play().catch(() => {})
      } catch (e) {}

      // Only show toast notification if user is NOT currently on the requests feed page
      // and the request modal is not active (active when driver is online and not on a trip)
      const showModal = isOnline && !currentTrip
      if (location.pathname !== '/requests' && !showModal) {
        showToastNotification(
          'New Request Available',
          `Ride to ${latestReq.drop.split(',')[0]} (${latestReq.distance}) for ₹${latestReq.fare.toFixed(2)}`,
          'warning'
        )
      }
    }
  }, [requests.length, location.pathname, isOnline, currentTrip])

  return {
    showToast: showToastNotification,
    requestPermission: async () => {
      if ('Notification' in window) {
        return await Notification.requestPermission()
      }
      return 'denied'
    }
  }
}
