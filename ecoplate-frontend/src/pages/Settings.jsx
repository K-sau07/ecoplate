import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { toast } from 'react-toastify'
import axios from 'axios'
import { API_BASE_URL } from '../services/api'
import '../styles/Settings.css'

function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || ''
    })
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const currentUser = JSON.parse(localStorage.getItem('user'))
      
      if (!currentUser || !currentUser.userId) {
        toast.error('User session invalid. Please login again.')
        return
      }
      
      await axios.put(
        `${API_BASE_URL}/profile/update/${currentUser.userId}`,
        { password: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const currentUser = JSON.parse(localStorage.getItem('user'))
      
      if (!currentUser || !currentUser.userId) {
        toast.error('User session invalid. Please login again.')
        return
      }
      
      const updateData = {
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' ') || formData.name.split(' ')[0],
        email: formData.email,
        phoneNumber: formData.phone
      }
      
      await axios.put(
        `${API_BASE_URL}/profile/update/${currentUser.userId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      const updatedUser = { ...currentUser, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'subscription', label: 'Subscription', icon: '💳' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' }
  ]

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Profile Information</h2>
            <p className="section-description">Update your personal details</p>
            
            <form onSubmit={handleSaveProfile} className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button type="submit" className="btn-save">
                Save Changes
              </button>
            </form>
          </div>
        )

      case 'security':
        return (
          <div className="settings-section">
            <h2>Security Settings</h2>
            <p className="section-description">Manage your password and security preferences</p>
            
            <form onSubmit={handleUpdatePassword} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
              </div>

              <button type="submit" className="btn-save">
                Update Password
              </button>
            </form>

            <div className="coming-soon-section">
              <h3>Two-Factor Authentication</h3>
              <p>Enhanced security with 2FA - Coming Soon</p>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            <p className="section-description">Control how you receive notifications</p>
            
            <div className="coming-soon-box">
              <div className="coming-soon-icon">🔔</div>
              <h3>Coming Soon</h3>
              <p>Customize email, SMS, and push notification settings.</p>
            </div>
          </div>
        )

      case 'subscription':
        return (
          <div className="settings-section">
            <h2>Manage Subscription</h2>
            <p className="section-description">View and manage your subscription plan</p>
            
            <div className="coming-soon-box">
              <div className="coming-soon-icon">💳</div>
              <h3>Coming Soon</h3>
              <p>Premium subscription plans with additional features will be available soon.</p>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="settings-section">
            <h2>Privacy Settings</h2>
            <p className="section-description">Control your data and privacy preferences</p>
            
            <div className="coming-soon-box">
              <div className="coming-soon-icon">🛡️</div>
              <h3>Coming Soon</h3>
              <p>Data export, account deletion, and privacy controls coming soon.</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole={user?.role || "CUSTOMER"} />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="settings-container">
            <div className="settings-header">
              <h1>Settings</h1>
            </div>

            <div className="settings-layout">
              <div className="settings-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="settings-content">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
