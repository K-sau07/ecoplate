import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NotificationBadge from '../components/NotificationBadge'
import { toast } from 'react-toastify'
import axios from 'axios'
import { API_BASE_URL } from '../services/api'
import '../styles/Dashboard.css'
import '../styles/Recipients.css'

function Recipients() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [topCustomers, setTopCustomers] = useState([])
  const [activeNGOs, setActiveNGOs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    fetchRecipients()
  }, [])

  const fetchRecipients = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const customerOrderCount = {}
      ordersResponse.data.forEach(order => {
        const customerId = order.customer.id
        if (!customerOrderCount[customerId]) {
          customerOrderCount[customerId] = {
            customer: order.customer,
            orderCount: 0,
            totalSpent: 0
          }
        }
        customerOrderCount[customerId].orderCount += 1
        customerOrderCount[customerId].totalSpent += parseFloat(order.totalPrice)
      })
      
      const frequentCustomers = Object.values(customerOrderCount)
        .filter(data => data.orderCount >= 10)
        .sort((a, b) => b.orderCount - a.orderCount)
      
      setTopCustomers(frequentCustomers)
      
      const claimsResponse = await axios.get(`${API_BASE_URL}/donations/store/claims`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const ngoClaimCount = {}
      claimsResponse.data.forEach(claim => {
        const ngoId = claim.ngo.id
        if (!ngoClaimCount[ngoId]) {
          ngoClaimCount[ngoId] = {
            ngo: claim.ngo,
            claimCount: 0,
            totalItems: 0
          }
        }
        ngoClaimCount[ngoId].claimCount += 1
        ngoClaimCount[ngoId].totalItems += claim.quantity
      })
      
      const activeNGOsList = Object.values(ngoClaimCount)
        .sort((a, b) => b.claimCount - a.claimCount)
      
      setActiveNGOs(activeNGOsList)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching recipients:', error)
      toast.error('Failed to load recipients data')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar onLogout={handleLogout} userRole="STORE_MANAGER" />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <p>Loading recipients data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="STORE_MANAGER" />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="search-bar">
            <input type="text" placeholder="Search recipients..." />
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
            <h1>Recipients</h1>
            <p>Your valued customers and NGO partners</p>
          </div>

          <div className="recipients-section">
            <div className="section-card">
              <h2>Top Customers (10+ Orders)</h2>
              {topCustomers.length === 0 ? (
                <div className="empty-state">
                  <p>No frequent customers yet. Customers with 10+ orders will appear here.</p>
                </div>
              ) : (
                <div className="recipients-list">
                  {topCustomers.map((data, index) => (
                    <div key={data.customer.id} className="recipient-card">
                      <div className="recipient-rank">#{index + 1}</div>
                      <div className="recipient-info">
                        <div className="recipient-avatar">
                          {data.customer.firstName?.charAt(0)}{data.customer.lastName?.charAt(0)}
                        </div>
                        <div className="recipient-details">
                          <h3>{data.customer.firstName} {data.customer.lastName}</h3>
                          <p>{data.customer.email}</p>
                        </div>
                      </div>
                      <div className="recipient-stats">
                        <div className="stat-item">
                          <span className="stat-value">{data.orderCount}</span>
                          <span className="stat-label">Orders</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">${data.totalSpent.toFixed(2)}</span>
                          <span className="stat-label">Total Spent</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section-card">
              <h2>Active NGO Partners</h2>
              {activeNGOs.length === 0 ? (
                <div className="empty-state">
                  <p>No NGO partners yet. NGOs who claim your donations will appear here.</p>
                </div>
              ) : (
                <div className="recipients-list">
                  {activeNGOs.map((data, index) => (
                    <div key={data.ngo.id} className="recipient-card">
                      <div className="recipient-rank">#{index + 1}</div>
                      <div className="recipient-info">
                        <div className="recipient-avatar ngo-avatar">
                          {data.ngo.firstName?.charAt(0)}{data.ngo.lastName?.charAt(0)}
                        </div>
                        <div className="recipient-details">
                          <h3>{data.ngo.firstName} {data.ngo.lastName}</h3>
                          <p>{data.ngo.email}</p>
                        </div>
                      </div>
                      <div className="recipient-stats">
                        <div className="stat-item">
                          <span className="stat-value">{data.claimCount}</span>
                          <span className="stat-label">Claims</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{data.totalItems}</span>
                          <span className="stat-label">Items Received</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recipients
