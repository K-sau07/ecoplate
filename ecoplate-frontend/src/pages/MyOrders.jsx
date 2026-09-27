import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import PaymentModal from '../components/PaymentModal'
import OrderSuccessModal from '../components/OrderSuccessModal'
import { API_BASE_URL } from '../services/api'
import '../styles/Dashboard.css'

function MyOrders() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/orders/my-customer-orders`, {
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handlePayNow = (order) => {
    setSelectedOrder(order)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (paymentData) => {
    setIsPaymentModalOpen(false)
    setPaymentResult(paymentData)
    setIsSuccessModalOpen(true)
    fetchOrders() // Refresh orders to show updated payment status
  }

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false)
    setPaymentResult(null)
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

  const getStatusMessage = (order) => {
    if (order.status === 'PENDING') {
      return 'Waiting for store confirmation'
    } else if (order.status === 'CONFIRMED' && !order.isPaid) {
      return 'Store confirmed - Please pay'
    } else if (order.isPaid && order.status === 'PAID') {
      return 'Payment successful - Being prepared'
    } else if (order.status === 'READY') {
      return 'Ready for pickup'
    } else if (order.status === 'COMPLETED') {
      return 'Order completed'
    } else if (order.status === 'CANCELLED') {
      return 'Order cancelled'
    }
    return ''
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="CUSTOMER" />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search your orders..." />
          </div>
          
          <div className="header-actions">
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
            <h1>My Orders</h1>
            <p>Track your food rescue orders</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <h3>No orders yet</h3>
              <p>Start ordering to reduce food waste and save money!</p>
              <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                Browse Food Items
              </button>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
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
                      <td className="item-name">{order.foodItemName}</td>
                      <td>{order.quantity}x</td>
                      <td className="price-highlight">${order.totalPrice}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className="status-message">{getStatusMessage(order)}</div>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        {order.status === 'CONFIRMED' && !order.isPaid && (
                          <button 
                            className="btn-pay-now"
                            onClick={() => handlePayNow(order)}
                          >
                            💳 Pay Now
                          </button>
                        )}
                        {order.isPaid && (
                          <span className="paid-badge">✓ Paid</span>
                        )}
                        {order.status === 'PENDING' && (
                          <button className="btn-cancel-order">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={selectedOrder}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Success Modal */}
      {paymentResult && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseSuccess}
          payment={paymentResult}
        />
      )}
    </div>
  )
}

export default MyOrders
