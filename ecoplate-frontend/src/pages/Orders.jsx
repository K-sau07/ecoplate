import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import NotificationBadge from '../components/NotificationBadge'
import { donationService, API_BASE_URL } from '../services/api'
import '../styles/Dashboard.css'

function Orders() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [donationClaims, setDonationClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [activeView, setActiveView] = useState('orders') // 'orders' or 'donations'

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    
    // Always fetch donation claims count for the button
    fetchDonationClaims()
    
    if (activeView === 'orders') {
      fetchOrders()
    }
  }, [filterStatus, activeView])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = filterStatus === 'ALL' 
        ? `${API_BASE_URL}/orders/my-orders`
        : `${API_BASE_URL}/orders/status/${filterStatus}`
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchDonationClaims = async () => {
    try {
      const claims = await donationService.getStoreClaims()
      setDonationClaims(claims)
    } catch (error) {
      console.error('Error fetching donation claims:', error)
      toast.error('Failed to load donation claims')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Order status updated successfully!')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
  }

  const acceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE_URL}/orders/${orderId}/accept`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Order accepted! Customer can now pay.')
      fetchOrders()
    } catch (error) {
      console.error('Error accepting order:', error)
      toast.error(error.response?.data?.message || 'Failed to accept order')
    }
  }

  const rejectOrder = async (orderId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE_URL}/orders/${orderId}/reject`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Order rejected')
      fetchOrders()
    } catch (error) {
      console.error('Error rejecting order:', error)
      toast.error('Failed to reject order')
    }
  }

  const handleAcceptClaim = async (claimId, foodItemName) => {
    if (!window.confirm(`Accept donation claim for "${foodItemName}"?`)) return

    const response = prompt('Message to NGO (optional):')
    
    try {
      await donationService.updateClaimStatus(claimId, 'ACCEPTED', response || 'Donation approved!')
      toast.success('Donation claim accepted!')
      fetchDonationClaims()
    } catch (error) {
      console.error('Error accepting claim:', error)
      toast.error('Failed to accept claim')
    }
  }

  const handleRejectClaim = async (claimId, foodItemName) => {
    const reason = prompt(`Reason for rejecting "${foodItemName}" claim:`)
    if (!reason) return

    try {
      await donationService.updateClaimStatus(claimId, 'REJECTED', reason)
      toast.success('Donation claim rejected')
      fetchDonationClaims()
    } catch (error) {
      console.error('Error rejecting claim:', error)
      toast.error('Failed to reject claim')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'status-pending'
      case 'CONFIRMED': return 'status-confirmed'
      case 'PAID': return 'status-paid'
      case 'READY': return 'status-ready'
      case 'COMPLETED': return 'status-completed'
      case 'CANCELLED': return 'status-cancelled'
      default: return ''
    }
  }

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'PAID': return 'READY'
      case 'READY': return 'COMPLETED'
      default: return null
    }
  }

  const getNextStatusLabel = (currentStatus) => {
    switch(currentStatus) {
      case 'PENDING': return 'Confirm Order'
      case 'CONFIRMED': return 'Mark Ready'
      case 'READY': return 'Complete Order'
      default: return null
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="STORE_MANAGER" />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search orders..." />
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
          <div className="page-title">
            <div>
              <h1>{activeView === 'orders' ? 'Order Management' : 'Donation Claims'}</h1>
              <p>{activeView === 'orders' 
                ? 'View and manage customer orders for your food items'
                : 'Review and manage NGO donation claims'
              }</p>
            </div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${activeView === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveView('orders')}
              >
                📦 Orders
              </button>
              <button 
                className={`toggle-btn ${activeView === 'donations' ? 'active' : ''}`}
                onClick={() => setActiveView('donations')}
              >
                🎁 Donation Claims ({donationClaims.length})
              </button>
            </div>
          </div>

          {activeView === 'orders' ? (
            <>
              <div className="filter-tabs">
            <button 
              className={filterStatus === 'ALL' ? 'active' : ''}
              onClick={() => setFilterStatus('ALL')}
            >
              All Orders ({orders.length})
            </button>
            <button 
              className={filterStatus === 'PENDING' ? 'active' : ''}
              onClick={() => setFilterStatus('PENDING')}
            >
              Pending
            </button>
            <button 
              className={filterStatus === 'CONFIRMED' ? 'active' : ''}
              onClick={() => setFilterStatus('CONFIRMED')}
            >
              Confirmed
            </button>
            <button 
              className={filterStatus === 'PAID' ? 'active' : ''}
              onClick={() => setFilterStatus('PAID')}
            >
              Paid
            </button>
            <button 
              className={filterStatus === 'READY' ? 'active' : ''}
              onClick={() => setFilterStatus('READY')}
            >
              Ready
            </button>
            <button 
              className={filterStatus === 'COMPLETED' ? 'active' : ''}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              Completed
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <h3>No orders found</h3>
              <p>Orders from customers will appear here</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Food Item</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{order.customerName}</div>
                          <div className="customer-email">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="item-name">{order.foodItemName}</td>
                      <td>{order.quantity}</td>
                      <td className="price-highlight">${order.totalPrice}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="actions-cell">
                        {/* PENDING orders - Show Accept/Reject */}
                        {order.status === 'PENDING' && (
                          <>
                            <button 
                              className="action-btn accept-btn"
                              onClick={() => acceptOrder(order.id)}
                            >
                              ✓ Accept
                            </button>
                            <button 
                              className="action-btn reject-btn"
                              onClick={() => rejectOrder(order.id)}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}

                        {/* CONFIRMED orders - Awaiting Payment */}
                        {order.status === 'CONFIRMED' && !order.isPaid && (
                          <div className="awaiting-payment">
                            ⏳ Awaiting Payment
                          </div>
                        )}

                        {/* PAID orders - Mark as Ready */}
                        {order.status === 'PAID' && order.isPaid && (
                          <button 
                            className="action-btn primary-btn"
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                          >
                            Mark as Ready
                          </button>
                        )}

                        {/* Other status updates */}
                        {getNextStatus(order.status) && order.status !== 'PENDING' && order.status !== 'PAID' && (
                          <button 
                            className="action-btn primary-btn"
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                          >
                            {getNextStatusLabel(order.status)}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </>
          ) : (
            // Donation Claims View
            <div className="donation-claims-section">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading donation claims...</p>
                </div>
              ) : donationClaims.length === 0 ? (
                <div className="empty-state">
                  <h3>No donation claims yet</h3>
                  <p>When NGOs claim your donations, they will appear here</p>
                </div>
              ) : (
                <div className="claims-table">
                  <table>
                    <colgroup>
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Food Item</th>
                        <th>NGO</th>
                        <th>Quantity</th>
                        <th>NGO Message</th>
                        <th>Status</th>
                        <th>Claimed On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationClaims.map((claim) => (
                        <tr key={claim.id}>
                          <td className="order-id">#{claim.id}</td>
                          <td className="item-name">{claim.foodItemName}</td>
                          <td>
                            <div className="customer-info">
                              <div className="customer-name">{claim.ngoName}</div>
                              <div className="customer-email">{claim.ngoEmail}</div>
                            </div>
                          </td>
                          <td>{claim.quantityClaimed} units</td>
                          <td className="message-cell" title={claim.ngoMessage || 'No message'}>
                            {claim.ngoMessage || <em>No message</em>}
                          </td>
                          <td>
                            <span className={`status-badge status-${claim.status.toLowerCase()}`}>
                              {claim.status}
                            </span>
                          </td>
                          <td>{new Date(claim.createdAt).toLocaleString()}</td>
                          <td className="actions-cell">
                            {claim.status === 'PENDING' && (
                              <>
                                <button 
                                  className="action-btn accept-btn"
                                  onClick={() => handleAcceptClaim(claim.id, claim.foodItemName)}
                                >
                                  ✓ Accept
                                </button>
                                <button 
                                  className="action-btn reject-btn"
                                  onClick={() => handleRejectClaim(claim.id, claim.foodItemName)}
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            {claim.status === 'ACCEPTED' && (
                              <span className="accepted-text">✓ Approved</span>
                            )}
                            {claim.status === 'REJECTED' && (
                              <span className="rejected-text">✗ Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
