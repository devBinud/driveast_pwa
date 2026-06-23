import React from 'react'
import './Button.css'

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, success, danger, ghost
  size = 'md', // sm, md, lg
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner"></span>
      ) : (
        <>
          {Icon && <span className="btn-icon"><Icon /></span>}
          {children}
        </>
      )}
    </button>
  )
}
