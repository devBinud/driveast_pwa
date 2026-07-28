import React from 'react'
import { FiDownload, FiClock, FiX, FiCheckCircle } from 'react-icons/fi'
import { usePWAInstall } from '../../../hooks/usePWAInstall'
import './PWAInstallModal.css'

export const PWAInstallModal = () => {
  const { isInstalled, showPrompt, installApp, snoozePrompt, hasDeferredPrompt } = usePWAInstall()

  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <div className="pwa-install-backdrop">
      <div className="pwa-install-card glass-panel animate-fade-in">
        {/* Close Button (Snoozes 1 Hour) */}
        <button
          className="pwa-close-btn"
          onClick={snoozePrompt}
          aria-label="Remind Me Later"
        >
          <FiX />
        </button>

        <div className="pwa-install-header">
          <div className="pwa-logo-wrapper">
            <img
              src="/logo/driveast_logo.jpg"
              alt="Driveeast App Icon"
              className="pwa-app-icon"
            />
          </div>
          <div className="pwa-header-text">
            <span className="pwa-badge">DRIVER PARTNER APP</span>
            <h3 className="pwa-title">Install DriveEast App</h3>
          </div>
        </div>

        <p className="pwa-description">
          Add DriveEast to your home screen for instant ride alerts, faster navigation, and full offline support.
        </p>

        <ul className="pwa-feature-list">
          <li>
            <FiCheckCircle className="check-icon" />
            <span>Instant Dispatch Push Notifications</span>
          </li>
          <li>
            <FiCheckCircle className="check-icon" />
            <span>Faster 1 Tap Home Screen Access</span>
          </li>
        </ul>

        <div className="pwa-action-buttons">
          {/* Later / Remind in 1 Hour */}
          <button
            type="button"
            className="pwa-btn pwa-btn-secondary"
            onClick={snoozePrompt}
          >
            <FiClock />
            <span>Later</span>
          </button>

          {/* Install Now / Accept */}
          <button
            type="button"
            className="pwa-btn pwa-btn-primary"
            onClick={installApp}
          >
            <FiDownload />
            <span>Install Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallModal
