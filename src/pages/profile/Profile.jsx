import React, { useEffect, useState } from 'react'
import { FiUser, FiTruck, FiSettings, FiLogOut, FiPhone, FiMail, FiFileText, FiRefreshCw, FiInfo } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { Card } from '../../components/common/Card/Card'
import { Button } from '../../components/common/Button/Button'
import './Profile.css'

export const Profile = () => {
  const { user, logout, fetchProfile } = useAuthStore()
  const [loading, setLoading] = useState(!user)
  const [notifications, setNotifications] = useState(true)

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
    licenseNumber: 'Not Provided',
    vehicleModel: 'Not Provided',
    vehicleNumber: 'Not Provided',
    avatar: 'https://ui-avatars.com/api/?name=Driver&background=fbbf24&color=000000&bold=true'
  }

  return (
    <div className="page-container animate-fade-in profile-page-container">
      {/* Profile Header card */}
      <div className="profile-hero-card text-center">
        <img src={driver.avatar} alt={driver.name} className="profile-avatar-large" />
        <h2 className="profile-name-title">{driver.name}</h2>
        <span className="profile-id-sub">{driver.id}</span>
      </div>

      {/* Driver contact card info */}
      <Card className="profile-section-card">
        <h3 className="profile-card-title">
          <FiUser /> Personal Details
        </h3>
        <div className="profile-info-rows">
          <div className="profile-info-row">
            <span className="info-lbl"><FiPhone /> Phone Number</span>
            <span>{driver.phone || 'Not Provided'}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl"><FiMail /> Email Address</span>
            <span>{driver.email || 'Not Provided'}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl"><FiFileText /> Driver License No.</span>
            <span className="fw-semibold">{driver.licenseNumber || 'Not Provided'}</span>
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
            <span>{driver.vehicleModel || 'Not Provided'}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl">License Plate</span>
            <span className="license-plate-badge">{driver.vehicleNumber || 'Not Provided'}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl">Status</span>
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
              onChange={() => setNotifications(!notifications)}
              className="toggle-switch-checkbox"
            />
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
            <span className="badge badge-success">v1.3.0</span>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--card-border)' }}>
          <Button
            variant="secondary"
            fullWidth
            size="sm"
            icon={FiRefreshCw}
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (let registration of registrations) {
                    registration.update()
                  }
                })
              }
              window.location.reload(true)
            }}
          >
            Check Updates & Force Refresh App
          </Button>
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
