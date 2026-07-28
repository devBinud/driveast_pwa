import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/common/Button/Button'
import { Input } from '../../components/common/Input/Input'
import './Login.css'

export const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error: authError } = useAuthStore()
  const [rawPhone, setRawPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handlePhoneChange = (e) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setRawPhone(cleanDigits)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!rawPhone || rawPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    const fullPhone = `+91${rawPhone}`
    const success = await login(fullPhone, password)
    if (success) {
      navigate('/')
    } else {
      setError(authError || 'Invalid credentials. Please verify your phone number & password.')
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-header">
        <h2>Welcome Back</h2>
        <p>Login to your Driver Account</p>
      </div>

      {(error || authError) && <div className="auth-error-alert">{error || authError}</div>}

      <div className="login-fields">
        {/* Custom India (+91) Phone Input */}
        <div className="input-group">
          <label className="input-label">
            Phone Number <span className="req-star">*</span>
          </label>
          <div className="phone-prefix-wrapper">
            <div className="india-prefix-badge">
              <svg width="20" height="14" viewBox="0 0 30 20" fill="none" className="india-flag-svg">
                <rect width="30" height="6.67" fill="#FF9933" />
                <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
                <rect y="13.33" width="30" height="6.67" fill="#138808" />
                <circle cx="15" cy="10" r="2.5" stroke="#000080" strokeWidth="0.8" fill="none" />
              </svg>
              <span className="prefix-code">+91</span>
              <span className="prefix-divider"></span>
            </div>
            <input
              type="tel"
              className="input-field phone-input-field"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              value={rawPhone}
              onChange={handlePhoneChange}
              required
            />
          </div>
        </div>

        {/* Password Input with Show/Hide Eye Toggle */}
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={FiLock}
          rightIcon={showPassword ? FiEyeOff : FiEye}
          onRightIconClick={() => setShowPassword(!showPassword)}
          required
        />
      </div>

      <Button 
        type="submit" 
        fullWidth 
        loading={isLoading}
      >
        Sign In
      </Button>

      <div className="login-footer">
        <p>
          By signing in, you agree to{' '}
          <a 
            href="https://driveast.com/terms-conditions/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="auth-legal-link"
          >
            Terms
          </a>{' '}
          &{' '}
          <a 
            href="https://driveast.com/privacy-policy/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="auth-legal-link"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  )
}
export default Login
