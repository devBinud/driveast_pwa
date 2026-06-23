import React from 'react'
import './Loader.css'

export const Loader = ({
  type = 'spinner', // spinner, skeleton, screen
  count = 3, // For skeleton lines
  height = '20px', // For skeleton custom height
  width = '100%' // For skeleton custom width
}) => {
  if (type === 'screen') {
    return (
      <div className="loader-screen">
        <div className="loader-screen-content">
          <div className="loader-spinner-large"></div>
          <img src="/logo/driveast_logo.jpg" alt="Driveast Logo" className="loader-logo-img" />
          <p className="loader-subtext">Initializing driver interface...</p>
        </div>
      </div>
    )
  }

  if (type === 'skeleton') {
    return (
      <div className="loader-skeleton-list">
        {Array.from({ length: count }).map((_, idx) => (
          <div 
            key={idx} 
            className="loader-skeleton-item glass-panel"
          >
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line-title" style={{ width: '40%' }}></div>
              <div className="skeleton-line-text" style={{ width: '80%' }}></div>
              <div className="skeleton-line-text" style={{ width: '60%' }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="loader-spinner-container">
      <div className="loader-spinner"></div>
    </div>
  )
}
