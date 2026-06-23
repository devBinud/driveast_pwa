import React from 'react'
import './EmptyState.css'

export const EmptyState = ({
  title = 'No Data Found',
  description = 'There is nothing to show here at the moment.',
  actionLabel,
  onActionClick,
  type = 'general' // general, requests, trips, notifications
}) => {
  const renderIllustration = () => {
    switch (type) {
      case 'requests':
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="70" fill="rgba(99, 102, 241, 0.05)" />
            <circle cx="100" cy="100" r="50" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="2" strokeDasharray="6 6" />
            {/* Map pin */}
            <path d="M100 65C88.9543 65 80 73.9543 80 85C80 99.5 100 125 100 125C100 125 120 99.5 120 85C120 73.9543 111.046 65 100 65ZM100 93.5C95.3056 93.5 91.5 89.6944 91.5 85C91.5 80.3056 95.3056 76.5 100 76.5C104.694 76.5 108.5 80.3056 108.5 85C108.5 89.6944 104.694 93.5 100 93.5Z" fill="var(--color-primary)" opacity="0.8">
              <animate attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="2s" repeatCount="indefinite" />
            </path>
            {/* Pulsing ring */}
            <circle cx="100" cy="125" r="15" stroke="var(--color-secondary)" strokeWidth="1.5" opacity="0.6">
              <animate attributeName="r" values="5;22" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        )
      case 'trips':
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="70" fill="rgba(14, 165, 233, 0.05)" />
            <path d="M70 120H130M75 120V90C75 76.1929 86.1929 65 100 65C113.807 65 125 76.1929 125 90V120M85 85H115M95 102H105" stroke="var(--color-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            <rect x="90" y="120" width="20" height="15" rx="3" fill="var(--color-primary)" opacity="0.8" />
          </svg>
        )
      default:
        return (
          <svg className="empty-illustration" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="75" fill="rgba(255,255,255,0.02)" />
            <path d="M120 70H80C74.4772 70 70 74.4772 70 80V120C70 125.523 74.4772 130 80 130H120C125.523 130 130 125.523 130 120V80C130 74.4772 125.523 70 120 70Z" stroke="var(--text-muted)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M85 90H115M85 102H115M85 114H105" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
    }
  }

  return (
    <div className="empty-state-container animate-fade-in">
      {renderIllustration()}
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionLabel && (
        <button className="empty-action-btn" onClick={onActionClick}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
