import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { orderService, foodItemService } from '../services/api'
import '../styles/Favorites.css'

function Favorites() {
  const navigate = useNavigate()
  const [favoriteItems, setFavoriteItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const orders = await orderService.getMyOrders()
      
      const itemCount = {}
      orders.forEach(order => {
        const itemId = order.foodItem.id
        itemCount[itemId] = (itemCount[itemId] || 0) + 1
      })
      
      const frequentItemIds = Object.entries(itemCount)
        .filter(([id, count]) => count >= 2)
        .map(([id]) => parseInt(id))
      
      const allItems = await foodItemService.getAll()
      const favorites = allItems.filter(item => frequentItemIds.includes(item.id))
      
      setFavoriteItems(favorites)
      setLoading(false)
    } catch (error) {
      console.error('Error loading favorites:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const calculateDiscount = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar onLogout={handleLogout} userRole="CUSTOMER" />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <p>Loading your favorites...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="CUSTOMER" />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="page-header">
            <h1>Your Favorites</h1>
            <p>Items you've ordered 2 or more times</p>
          </div>

          {favoriteItems.length === 0 ? (
            <div className="empty-state">
              <p>No favorites yet. Order items 2+ times to see them here!</p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favoriteItems.map(item => (
                <div key={item.id} className="favorite-card">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.itemName} className="item-image" />
                  )}
                  <div className="item-content">
                    <h3 className="item-name">{item.itemName}</h3>
                    <p className="item-category">{item.category}</p>
                    <div className="item-pricing">
                      <span className="current-price">${item.currentPrice}</span>
                      <span className="original-price">${item.originalPrice}</span>
                      <span className="discount-badge">
                        {calculateDiscount(item.originalPrice, item.currentPrice)}% OFF
                      </span>
                    </div>
                    <div className="item-details">
                      <span className="item-quantity">Stock: {item.quantity}</span>
                      <span className={`item-status status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Favorites
