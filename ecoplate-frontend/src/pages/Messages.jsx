import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { notificationService } from '../services/api'
import '../styles/Messages.css'

const TYPE_LABEL = {
  INFO: 'Info',
  SUCCESS: 'Success',
  WARNING: 'Warning',
  ALERT: 'Alert',
}

function Messages() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all | unread

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll()
      // newest first — the API returns them in insertion order
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setNotifications(sorted)
      setError(null)
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Could not load your notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    // optimistic — the row greys out immediately, reverts if the call fails
    const previous = notifications
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    try {
      await notificationService.markAsRead(id)
    } catch (err) {
      console.error('Error marking as read:', err)
      setNotifications(previous)
    }
  }

  const handleMarkAllRead = async () => {
    const previous = notifications
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await notificationService.markAllAsRead()
    } catch (err) {
      console.error('Error marking all as read:', err)
      setNotifications(previous)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const timeAgo = (iso) => {
    const secs = Math.max(0, Math.round((Date.now() - new Date(iso)) / 1000))
    if (secs < 60) return 'just now'
    const mins = Math.round(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.round(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.round(hrs / 24)
    if (days < 30) return `${days}d ago`
    return new Date(iso).toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const visible =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole={user?.role || 'CUSTOMER'} />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="page-title">
            <h1>Notifications</h1>
            <p>
              {unreadCount > 0
                ? `${unreadCount} unread ${unreadCount === 1 ? 'update' : 'updates'}`
                : 'You are all caught up'}
            </p>
          </div>

          <div className="notif-toolbar">
            <div className="notif-filters">
              <button
                className={`notif-filter ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </button>
              <button
                className={`notif-filter ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          {loading && <div className="notif-state">Loading notifications…</div>}

          {error && (
            <div className="notif-state notif-error">
              {error}
              <button className="notif-retry" onClick={loadNotifications}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="notif-state">
              {filter === 'unread'
                ? 'Nothing unread.'
                : 'No notifications yet. Updates about your orders, claims and listings will appear here.'}
            </div>
          )}

          <ul className="notif-list">
            {visible.map((n) => (
              <li
                key={n.id}
                className={`notif-item ${n.isRead ? 'read' : 'unread'} type-${(n.type || 'INFO').toLowerCase()}`}
              >
                <span className="notif-dot" aria-hidden="true" />
                <div className="notif-body">
                  <div className="notif-meta">
                    <span className="notif-type">
                      {TYPE_LABEL[n.type] || 'Info'}
                    </span>
                    <span className="notif-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="notif-message">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button
                    className="notif-read-btn"
                    onClick={() => handleMarkRead(n.id)}
                    aria-label="Mark as read"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Messages
