import React, { useEffect, useState } from 'react'
import { FiUser, FiTruck, FiSettings, FiLogOut, FiPhone, FiMail, FiFileText, FiRefreshCw, FiInfo, FiMapPin, FiBell, FiBellOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { Card } from '../../components/common/Card/Card'
import { Button } from '../../components/common/Button/Button'
import { pushNotificationService } from '../../services/pushNotificationService'
import './Profile.css'

const getPushSupportState = () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  return Notification.permission // 'granted' | 'denied' | 'default'
}

export const Profile = () => {
  const { user, logout, fetchProfile } = useAuthStore()
  const [loading, setLoading] = useState(!user)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('ride_alerts_enabled')
    return saved !== null ? saved === 'true' : true
  })
  const [pushState, setPushState] = useState(getPushSupportState)
  const [enablingPush, setEnablingPush] = useState(false)

  const handleToggleNotifications = (val) => {
    setNotifications(val)
    localStorage.setItem('ride_alerts_enabled', val ? 'true' : 'false')
  }

  const handleEnablePush = async () => {
    setEnablingPush(true)
    try {
      await pushNotificationService.subscribe()
    } finally {
      const newState = getPushSupportState()
      setPushState(newState)
      setEnablingPush(false)
      if (newState === 'granted') {
        toast.success('Ride request notifications are on')
      } else if (newState === 'denied') {
        toast.error('Notifications were blocked. Enable them from your browser/site settings.')
      }
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadProfileData = async () => {
      setLoading(true)
      await fetchProfile()
      if (isMounted) setLoading(false)
    }
    loadProfileData()
    return () => { isMounted = false }
  }, [fetchProfile])

  if (loading && !user) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen text-center">
        <FiRefreshCw className="animate-spin text-3xl text-amber-500 mb-3" style={{ animation: 'spin 1s linear infinite' }} />
        <p className="text-secondary font-medium">Loading driver profile...</p>
      </div>
    )
  }

  const driver = user || {
    id: 'Not Provided',
    name: 'Not Provided',
    phone: 'Not Provided',
    email: 'Not Provided',
    address: null,
    licenseNumber: 'Not Provided',
    vehicleModel: 'Not Provided',
    vehicleNumber: 'Not Provided',
    vehicleType: 'Not Provided',
    seatCapacity: null,
    fuelType: 'Not Provided',
    availabilityStatus: 'AVAILABLE',
    avatar: 'https://ui-avatars.com/api/?name=Driver&background=fbbf24&color=000000&bold=true'
  }

  return (
    <div className="page-container animate-fade-in profile-page-container">
      {/* Profile Header card */}
      <div className="profile-hero-card text-center">
        <img src={driver.avatar} alt={driver.name} className="profile-avatar-large" />
        <h2 className="profile-name-title">{driver.name}</h2>
      </div>

      {/* Driver contact card info */}
      <Card className="profile-section-card">
        <h3 className="profile-card-title">
          <FiUser /> Personal Details
        </h3>
        <div className="profile-info-rows">
          <div className="profile-info-row">
            <span className="info-lbl"><FiPhone /> Phone Number</span>
            <span className="profile-row-val">{driver.phone || 'Not Provided'}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl"><FiMail /> Email Address</span>
            <span className="profile-row-val">{driver.email || 'Not Provided'}</span>
          </div>
          {driver.address && (
            <div className="profile-info-row">
              <span className="info-lbl"><FiMapPin /> Address</span>
              <span className="profile-row-val">{driver.address}</span>
            </div>
          )}
          <div className="profile-info-row">
            <span className="info-lbl"><FiFileText /> Driver License No.</span>
            <span className="profile-row-val font-semibold">{driver.licenseNumber || 'Not Provided'}</span>
          </div>
        </div>
      </Card>

      {/* Vehicle Info */}
      <Card className="profile-section-card">
        <h3 className="profile-card-title">
          <FiTruck /> Vehicle Specifications
        </h3>
        <div className="profile-info-rows">
          <div className="profile-info-row">
            <span className="info-lbl">Vehicle Model</span>
            <span className="profile-row-val">{driver.vehicleModel || 'Not Provided'}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl">License Plate</span>
            <span className="profile-row-val font-semibold">{driver.vehicleNumber || 'Not Provided'}</span>
          </div>
          {driver.vehicleType && driver.vehicleType !== 'Not Provided' && (
            <div className="profile-info-row">
              <span className="info-lbl">Vehicle Type</span>
              <span className="profile-row-val">{driver.vehicleType}</span>
            </div>
          )}
          {driver.seatCapacity && (
            <div className="profile-info-row">
              <span className="info-lbl">Seating Capacity</span>
              <span className="profile-row-val">{driver.seatCapacity} Seats</span>
            </div>
          )}
          {driver.fuelType && driver.fuelType !== 'Not Provided' && (
            <div className="profile-info-row">
              <span className="info-lbl">Fuel Type</span>
              <span className="profile-row-val" style={{ textTransform: 'capitalize' }}>
                {String(driver.fuelType).toLowerCase()}
              </span>
            </div>
          )}
          {driver.perKmPrice != null && (
            <div className="profile-info-row">
              <span className="info-lbl">Per KM Rate</span>
              <span className="profile-row-val font-semibold">₹{Number(driver.perKmPrice).toFixed(2)} / km</span>
            </div>
          )}
          {driver.driverAllowance != null && (
            <div className="profile-info-row">
              <span className="info-lbl">Driver Allowance</span>
              <span className="profile-row-val">₹{Number(driver.driverAllowance).toFixed(2)} / day</span>
            </div>
          )}
          <div className="profile-info-row">
            <span className="info-lbl">Verification Status</span>
            <span className="text-success font-semibold">
              {driver.isActive ? 'Documents Verified' : 'Account Inactive'}
            </span>
          </div>
        </div>
      </Card>

      {/* Preferences Settings */}
      <Card className="profile-section-card">
        <h3 className="profile-card-title">
          <FiSettings /> App Preferences
        </h3>
        <div className="profile-info-rows">
          <div className="profile-toggle-row">
            <div className="toggle-lbl-group">
              <strong>Ride Alerts</strong>
              <span>Sound on incoming requests</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => handleToggleNotifications(e.target.checked)}
              className="toggle-switch-checkbox"
            />
          </div>

          <div className="profile-toggle-row">
            <div className="toggle-lbl-group">
              <strong>Push Notifications</strong>
              <span>
                {pushState === 'granted' && 'On -- ride requests reach you even when the app is minimized'}
                {pushState === 'default' && 'Off -- allow notifications to get rides while minimized'}
                {pushState === 'denied' && 'Blocked -- enable notifications for this site in your browser settings'}
                {pushState === 'unsupported' && 'Not supported on this browser'}
              </span>
            </div>
            {pushState === 'granted' ? (
              <span className="push-status-badge on"><FiBell /> Enabled</span>
            ) : pushState === 'unsupported' ? (
              <span className="push-status-badge off"><FiBellOff /> Unavailable</span>
            ) : (
              <Button
                variant={pushState === 'denied' ? 'secondary' : 'primary'}
                size="sm"
                icon={FiBell}
                loading={enablingPush}
                disabled={pushState === 'denied'}
                onClick={handleEnablePush}
              >
                {pushState === 'denied' ? 'Blocked' : 'Allow'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* App Info & PWA Version Card */}
      <Card className="profile-section-card">
        <h3 className="profile-card-title">
          <FiInfo /> About App
        </h3>
        <div className="profile-info-rows">
          <div className="profile-info-row">
            <span className="info-lbl">App Name</span>
            <span className="fw-semibold">Driveast Partner PWA</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl">App Version</span>
            <span className="badge badge-success">v1.3.1</span>
          </div>
        </div>
      </Card>

      {/* Logout button */}
      <Button
        variant="danger"
        onClick={logout}
        fullWidth
        size="lg"
        icon={FiLogOut}
      >
        Sign Out / Log Out
      </Button>
    </div>
  )
}
export default Profile
