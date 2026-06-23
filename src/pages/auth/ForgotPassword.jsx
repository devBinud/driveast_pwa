import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import { Button } from '../../components/common/Button/Button'
import { Input } from '../../components/common/Input/Input'
import './ForgotPassword.css'

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false)
      setSuccess('If this email is registered, you will receive password reset instructions shortly.')
    }, 1500)
  }

  return (
    <form className="forgot-password-form" onSubmit={handleSubmit}>
      <div className="forgot-header">
        <h2>Reset Password</h2>
        <p>Enter your email to receive recovery instructions</p>
      </div>

      {error && <div className="auth-error-alert">{error}</div>}
      {success && <div className="auth-success-alert">{success}</div>}

      {!success && (
        <>
          <div className="forgot-fields">
            <Input
              label="Email Address"
              type="email"
              placeholder="driver@driveast.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={FiMail}
              required
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            loading={isLoading}
          >
            Send Instructions
          </Button>
        </>
      )}

      <div className="forgot-back-link-container">
        <Link to="/login" className="forgot-back-link">
          <FiArrowLeft /> Back to Sign In
        </Link>
      </div>
    </form>
  )
}
export default ForgotPassword
