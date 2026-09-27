import React, { useState, useEffect, useRef } from 'react'
import { notificationService } from '../services/api'
import '../styles/NotificationBadge.css'

const NotificationBadge = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Initial fetch and polling for unread count
    useEffect(() => {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount()
            setUnreadCount(count)
        } catch (error) {
            console.error('Failed to fetch notification count', error)
        }
    }

    const handleToggle = async () => {
        if (!isOpen) {
            try {
                const list = await notificationService.getAll()
                setNotifications(list)
            } catch (error) {
                console.error('Failed to fetch notifications', error)
            }
        }
        setIsOpen(!isOpen)
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(notifications.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read', error)
        }
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now - date) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        return date.toLocaleDateString()
    }

    return (
        <div className="notification-container" ref={dropdownRef}>
            <div className="notification-icon" onClick={handleToggle}>
                🔔
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">No notifications yet</div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                >
                                    <div className="notification-content">
                                        {notification.type === 'WARNING' && '⚠️ '}
                                        {notification.type === 'SUCCESS' && '✅ '}
                                        {notification.type === 'INFO' && 'ℹ️ '}
                                        {notification.message}
                                    </div>
                                    <div className="notification-time">
                                        {formatTime(notification.createdAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBadge