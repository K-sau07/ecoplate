import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import ReviewModal from '../components/ReviewModal'
import { API_BASE_URL } from '../services/api'
import '../styles/Dashboard.css'
import '../styles/CustomerDashboard.css'

function CustomerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [sortByDistance, setSortByDistance] = useState(false)
  const [selectedItemForReview, setSelectedItemForReview] = useState(null)

  const categories = [
    { id: 'ALL', label: 'All Items', icon: '🍽️' },
    { id: 'VEGETABLES', label: 'Vegetables', icon: '🥬' },
    { id: 'FRUITS', label: 'Fruits', icon: '🍎' },
    { id: 'DAIRY', label: 'Dairy', icon: '🥛' },
    { id: 'BAKERY', label: 'Bakery', icon: '🍞' },
    { id: 'PREPARED', label: 'Prepared Food', icon: '🍱' },
  ]

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    fetchFoodItems()
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied, using default Boston location')
          setUserLocation({ latitude: 42.3601, longitude: -71.0589 })
        }
      )
    }
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null
    
    const R = 6371 // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    return distance.toFixed(1) // Return in km with 1 decimal
  }

  useEffect(() => {
    filterItems()
  }, [searchQuery, selectedCategory, foodItems])

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/food-items`)
      setFoodItems(response.data)
      setFilteredItems(response.data)
    } catch (error) {
      console.error('Error fetching food items:', error)
      toast.error('Failed to load food items')
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = foodItems

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // ALWAYS add distance to each item if user location is available
    if (userLocation) {
      filtered = filtered.map(item => ({
        ...item,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.storeLatitude,
          item.storeLongitude
        )
      }))
      
      // Sort by distance only if "Near Me" is active
      if (sortByDistance) {
        filtered = filtered.sort((a, b) => {
          if (a.distance === null) return 1
          if (b.distance === null) return -1
          return parseFloat(a.distance) - parseFloat(b.distance)
        })
      }
    }

    setFilteredItems(filtered)
  }

  const addToCart = (item, quantity = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, cartQuantity: cartItem.cartQuantity + quantity }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, cartQuantity: quantity }])
    }
    
    toast.success(`${item.name} added to cart!`)
    setShowCart(true)
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
    toast.info('Item removed from cart')
  }

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
    ))
  }

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!')
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      for (const item of cart) {
        await axios.post(`${API_BASE_URL}/orders`, {
          foodItemId: item.id,
          quantity: item.cartQuantity,
          customerNotes: ''
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      toast.success('Orders placed successfully!')
      setCart([])
      setShowCart(false)
      fetchFoodItems()
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.currentPrice * item.cartQuantity), 0).toFixed(2)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="CUSTOMER" />
      
      <div className="dashboard-main customer-main">
        <header className="customer-header">
          <div className="header-top">
            <h1>Discover Food Near You</h1>
            <div className="header-actions">
              <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
                🛒 Cart ({cart.length})
              </button>
              <div className="user-avatar">
                <div className="avatar-circle">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <span>{user?.firstName}</span>
              </div>
            </div>
          </div>

          <div className="search-section">
            <div className="search-bar-large">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search for food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="category-filters">
            <button
              className={`category-chip ${sortByDistance ? 'active' : ''}`}
              onClick={() => setSortByDistance(!sortByDistance)}
            >
              <span className="category-icon">📍</span>
              Near Me
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        <div className="customer-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading delicious food...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <h3>No items found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="food-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="food-card">
                  <div className="food-card-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="image-placeholder">
                        🍽️
                      </div>
                    )}
                    <div className="discount-tag">
                      {item.discountPercentage}% OFF
                    </div>
                  </div>

                  <div className="food-card-content">
                    <div className="food-header">
                      <h3>{item.name}</h3>
                      <div className="store-info">
                        <div className="store-badge">
                          🏪 {item.storeName || item.storeManagerName}
                        </div>
                        {item.storeAddress && (
                          <div className="store-address">
                            📍 {item.storeAddress}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="food-description">{item.description}</p>

                    <div className="food-meta">
                      {item.distance && (
                        <span className="distance-badge-primary">
                          📍 {item.distance} km away
                        </span>
                      )}
                      <span className="expires-badge">
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                      <span className="quantity-badge">
                        {item.quantity} left
                      </span>
                    </div>

                    <div className="food-footer">
                      <div className="price-section">
                        <span className="original-price">${item.originalPrice}</span>
                        <span className="current-price">${item.currentPrice}</span>
                      </div>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(item)}
                        disabled={item.quantity === 0}
                      >
                        {item.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>

                    <button 
                      className="food-card-reviews-btn"
                      onClick={() => setSelectedItemForReview(item)}
                    >
                      ⭐ View Reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedItemForReview && (
        <ReviewModal
          foodItem={selectedItemForReview}
          currentUserId={user?.id}
          onClose={() => setSelectedItemForReview(null)}
        />
      )}

      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h2>Your Cart</h2>
            <button className="close-cart" onClick={() => setShowCart(false)}>×</button>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">${item.currentPrice} each</p>
                    </div>
                    <div className="cart-item-controls">
                      <button onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}>−</button>
                      <span>{item.cartQuantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}>+</button>
                    </div>
                    <button className="remove-item" onClick={() => removeFromCart(item.id)}>×</button>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-price">${getTotalPrice()}</span>
                </div>
                <button className="checkout-btn" onClick={placeOrder}>
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard
