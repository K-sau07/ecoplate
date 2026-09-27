import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NotificationBadge from '../components/NotificationBadge'
import { donationService , API_BASE_URL } from '../services/api'
import { toast } from 'react-toastify'
import '../styles/Dashboard.css'
import '../styles/MyClaims.css'

function MyClaims() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const claimsData = await donationService.getNgoClaims()
      setClaims(claimsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching claims:', error)
      toast.error('Failed to load your claims')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleMarkCollected = async (claimId) => {
    if (!window.confirm('Mark this donation as collected?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_BASE_URL}/donations/claims/${claimId}/collect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Marked as collected!')
      fetchClaims()
    } catch (error) {
      console.error('Error marking as collected:', error)
      toast.error('Failed to update status')
    }
  }

  const getFilteredClaims = () => {
    if (filterStatus === 'ALL') return claims
    return claims.filter(claim => claim.status === filterStatus)
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'PENDING': return 'status-pending'
      case 'ACCEPTED': return 'status-accepted'
      case 'REJECTED': return 'status-rejected'
      case 'COLLECTED': return 'status-collected'
      default: return ''
    }
  }

  const filteredClaims = getFilteredClaims()

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="NGO" />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="search-bar">
            <input type="text" placeholder="Search your claims..." />
          </div>
          
          <div className="header-actions">
            <NotificationBadge />
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-header">
            <h1>My Claims</h1>
            <p>Track your donation claims and pickup status</p>
          </div>

          <div className="filter-tabs">
            <button 
              className={filterStatus === 'ALL' ? 'active' : ''} 
              onClick={() => setFilterStatus('ALL')}
            >
              All Claims
            </button>
            <button 
              className={filterStatus === 'PENDING' ? 'active' : ''} 
              onClick={() => setFilterStatus('PENDING')}
            >
              Pending
            </button>
            <button 
              className={filterStatus === 'ACCEPTED' ? 'active' : ''} 
              onClick={() => setFilterStatus('ACCEPTED')}
            >
              Accepted
            </button>
            <button 
              className={filterStatus === 'COLLECTED' ? 'active' : ''} 
              onClick={() => setFilterStatus('COLLECTED')}
            >
              Collected
            </button>
          </div>

          {loading ? (
            <p>Loading claims...</p>
          ) : filteredClaims.length === 0 ? (
            <div className="empty-state">
              <p>No claims found. Start claiming donations to feed your community!</p>
            </div>
          ) : (
            <div className="claims-grid">
              {filteredClaims.map(claim => (
                <div key={claim.id} className="claim-card">
                  <div className="claim-header">
                    <h3>{claim.foodItemName}</h3>
                    <span className={`status-badge ${getStatusClass(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                  
                  <div className="claim-details">
                    <div className="detail-row">
                      <span className="label">Store:</span>
                      <span className="value">{claim.storeName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Quantity:</span>
                      <span className="value">{claim.quantityClaimed} units</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Claimed on:</span>
                      <span className="value">{new Date(claim.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {claim.ngoMessage && (
                    <div className="claim-notes">
                      <strong>Your Message:</strong> {claim.ngoMessage}
                    </div>
                  )}

                  {claim.storeResponse && (
                    <div className="store-response">
                      <strong>Store Response:</strong> {claim.storeResponse}
                    </div>
                  )}

                  {claim.status === 'ACCEPTED' && (
                    <button 
                      className="btn-collect"
                      onClick={() => handleMarkCollected(claim.id)}
                    >
                      Mark as Collected
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyClaims
