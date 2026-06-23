import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        {/* Logo + Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <img src="/logo/driveast_logo.jpg" alt="Driveast" className="footer-logo-img" />
          </Link>
          <div className="footer-brand-text">
            <span className="footer-brand-tag">Partner</span>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Row */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Driveast Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="footer-location">
            Guwahati, Assam - India
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
