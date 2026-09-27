import React from 'react'
import '../styles/StatsCard.css'

const StatsCard = ({ title, value, change, period, icon, trend }) => {
  return (
    <div className="stats-card">
      <div className="stats-header">
        <h3>{title}</h3>
        <span className="stats-icon">{icon}</span>
      </div>
      
      <div className="stats-value">{value}</div>
      
      <div className="stats-footer">
        <span className={`stats-change ${trend}`}>
          {trend === 'up' ? '↗' : '↘'} {change}
        </span>
        <span className="stats-period">{period}</span>
      </div>
    </div>
  )
}

export default StatsCard