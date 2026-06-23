import React from 'react'
import './Card.css'

export const Card = ({
  children,
  className = '',
  interactive = false,
  onClick,
  padding = 'md', // none, sm, md, lg
  glow = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`card glass-panel ${interactive ? 'interactive' : ''} ${onClick ? 'clickable' : ''} ${glow ? 'card-glow' : ''} card-p-${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
