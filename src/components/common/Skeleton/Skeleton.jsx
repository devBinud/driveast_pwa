import React from 'react'
import './Skeleton.css'

export const Skeleton = ({ className = '', style }) => (
  <span className={`skeleton-bar ${className}`} style={style} />
)

export default Skeleton
