import React from 'react'
import './Input.css'

export const Input = ({
  label,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  value,
  onChange,
  ...props
}) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
      {label && <label className="input-label">{label}{required && <span className="req-star">*</span>}</label>}
      <div className="input-wrapper">
        {Icon && (
          <span className="input-icon-left">
            <Icon />
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          className={`input-field ${Icon ? 'with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}
