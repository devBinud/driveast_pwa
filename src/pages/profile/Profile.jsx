import React, { useState } from 'react'
import { FiUser, FiTruck, FiSettings, FiLogOut, FiAward, FiPhone, FiMail } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { Card } from '../../components/common/Card/Card'
import { Button } from '../../components/common/Button/Button'
import './Profile.css'

export const Profile = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)

  if (!user) return null

  return (
    <div className="page-container animate-fade-in profile-page-container">
      {/* Profile Header card */}
      <div className="profile-hero-card text-center">
        <img src={user.avatar} alt={user.name} className="profile-avatar-large" />
        <h2 className="profile-name-title">{user.name}</h2>
        <span className="profile-id-sub">{user.id}</span>
        
        <div className="profile-rating-badge">
          <FiAward />
          <span>{user.rating.toFixed(2)} Driver Rating</span>
        </div>
      </div>

      {/* Driver contact card info */}
      <Card className="profile-section-card">
        <h3 className="profile-card-title">
          <FiUser /> Personal Details
        </h3>
        <div className="profile-info-rows">
          <div className="profile-info-row">
            <span className="info-lbl">Email Address</span>
            <span>{user.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl">Phone Number</span>
            <span>{user.phone}</span>
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
            <span>{user.vehicleModel}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl">License Plate</span>
            <span className="license-plate-badge">{user.vehicleNumber}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-lbl">Status</span>
            <span className="text-success font-semibold">Documents Verified</span>
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
              <strong>Night Drive Theme</strong>
              <span>Always run dark neon theme</span>
            </div>
            <input 
              type="checkbox" 
              checked={theme === 'dark'} 
              onChange={toggleTheme}
              className="toggle-switch-checkbox"
            />
          </div>

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
