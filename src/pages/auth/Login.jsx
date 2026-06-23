import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/common/Button/Button'
import { Input } from '../../components/common/Input/Input'
import './Login.css'

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      const success = login(email, password)
      setIsLoading(false)
      if (success) {
        navigate('/')
      } else {
        setError('Invalid credentials. Use any values to login.')
      }
    }, 1200)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-header">
        <h2>Welcome Back</h2>
        <p>Login to your driver account</p>
      </div>

      {error && <div className="auth-error-alert">{error}</div>}

      <div className="login-fields">
        <Input
          label="Email Address"
          type="email"
          placeholder="driver@driveast.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={FiMail}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={FiLock}
          required
        />
      </div>

      <div className="login-actions">
        <Link to="/forgot-password" className="forgot-password-link">
          Forgot Password?
        </Link>
      </div>

      <Button 
        type="submit" 
        fullWidth 
        loading={isLoading}
      >
        Sign In
      </Button>

      <div className="login-footer">
        <p>By signing in, you agree to our Terms and Conditions.</p>
      </div>
    </form>
  )
}
export default Login
