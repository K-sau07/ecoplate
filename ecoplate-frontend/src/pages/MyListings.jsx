import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import NotificationBadge from '../components/NotificationBadge'
import CreateFoodItemModal from '../components/CreateFoodItemModal'
import EditFoodItemModal from '../components/EditFoodItemModal'
import { foodItemService, API_BASE_URL } from '../services/api'
import '../styles/Dashboard.css'

function MyListings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    fetchFoodItems()
  }, [])

  const fetchFoodItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/food-items/my-items`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFoodItems(response.data)
    } catch (error) {
      console.error('Error fetching food items:', error)
      toast.error('Failed to load your listings')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE_URL}/food-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Listing deleted successfully!')
      fetchFoodItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete listing')
    }
  }

  const handleMarkAsDonation = async (id, itemName) => {
    if (!window.confirm(`Mark "${itemName}" as a FREE donation for NGOs?`)) {
      return
    }

    try {
      await foodItemService.markAsDonation(id)
      toast.success('Item marked as donation successfully! NGOs can now claim it for free.')
      fetchFoodItems()
    } catch (error) {
      console.error('Error marking as donation:', error)
      toast.error('Failed to mark item as donation')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
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
            <input type="text" placeholder="Search your listings..." />
          </div>
          
          <div className="header-actions">
            <button className="new-listing-btn" onClick={() => setIsCreateModalOpen(true)}>
              + New Listing
            </button>
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
            <h1>My Listings</h1>
            <p>Manage your food items and inventory</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your listings...</p>
            </div>
          ) : foodItems.length === 0 ? (
            <div className="empty-state">
              <h3>No items listed yet</h3>
              <p>Start adding food items to reduce waste and help your community</p>
              <button className="new-listing-btn" onClick={() => setIsCreateModalOpen(true)}>
                + Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="listings-table">
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Original Price</th>
                    <th>Current Price</th>
                    <th>Discount</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Donation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foodItems.map((item) => (
                    <tr key={item.id}>
                      <td className="item-name">{item.name}</td>
                      <td className="item-description">{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>${item.originalPrice}</td>
                      <td className="price-highlight">${item.currentPrice}</td>
                      <td>
                        <span className={`discount-badge ${item.discountPercentage >= 50 ? 'high' : 'medium'}`}>
                          {item.discountPercentage}% OFF
                        </span>
                      </td>
                      <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.isDonation ? (
                          <span className="donation-badge">✓ Donation</span>
                        ) : (
                          <span className="not-donation">For Sale</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        {!item.isDonation && (
                          <button 
                            className="action-btn donation-btn" 
                            onClick={() => handleMarkAsDonation(item.id, item.name)}
                            title="Mark as free donation for NGOs"
                          >
                            🎁 Donate
                          </button>
                        )}
                        <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateFoodItemModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchFoodItems}
      />

      <EditFoodItemModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingItem(null)
        }}
        onSuccess={fetchFoodItems}
        item={editingItem}
      />
    </div>
  )
}

export default MyListings
