import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NotificationBadge from '../components/NotificationBadge'
import StatsCard from '../components/StatsCard'
import ClaimDonationModal from '../components/ClaimDonationModal'
import { foodItemService, donationService } from '../services/api'
import '../styles/Dashboard.css'

/**
 * NGO Dashboard Component
 * Displays available food items that NGOs can claim for free distribution.
 * NGOs help feed communities by claiming surplus food from stores.
 */
const NGODashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [donationItems, setDonationItems] = useState([])
  const [myClaims, setMyClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'donations', 'myClaims'
  const [selectedItem, setSelectedItem] = useState(null)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)

  /**
   * Initialize component and fetch user data
   */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      navigate('/login')
      return
    }
    setUser(userData)
    fetchAllData()
  }, [])

  /**
   * Fetch all data: food items, donations, and claims
   */
  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [allItems, donations, claims] = await Promise.all([
        foodItemService.getAll(),
        foodItemService.getAllDonations(),
        donationService.getNgoClaims()
      ])
      setFoodItems(allItems)
      setDonationItems(donations)
      setMyClaims(claims)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  /**
   * Handle claiming a donation
   */
  const handleClaimDonation = async (claimData) => {
    try {
      await donationService.claimDonation(claimData)
      alert('Donation claimed successfully! Waiting for store approval.')
      await fetchAllData() // Refresh all data
      setIsClaimModalOpen(false)
    } catch (error) {
      console.error('Error claiming donation:', error)
      throw new Error(error.response?.data?.message || 'Failed to claim donation')
    }
  }

  /**
   * Open claim modal for a specific item
   */
  const openClaimModal = (item) => {
    setSelectedItem(item)
    setIsClaimModalOpen(true)
  }

  /**
   * Filter food items based on active tab and search term
   */
  const getFilteredItems = () => {
    let items = []
    
    switch(activeTab) {
      case 'all':
        items = foodItems
        break
      case 'donations':
        items = donationItems
        break
      case 'myClaims':
        return myClaims // Claims don't need further filtering
      default:
        items = foodItems
    }
    
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="NGO" />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search for food donations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            <h1>Available Food Donations</h1>
            <p>Claim food items to feed your community</p>
          </div>

          <div className="stats-grid">
            <StatsCard
              title="Available Donations"
              value={donationItems.length}
              change=""
              period="items to claim"
              icon="🎁"
              trend="neutral"
            />
            <StatsCard
              title="Total Value"
              value={`$${donationItems.reduce((sum, item) => sum + Number(item.originalPrice || 0), 0).toFixed(0)}`}
              change="FREE"
              period="for your organization"
              icon="💝"
              trend="up"
            />
            <StatsCard
              title="Meals Potential"
              value={donationItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              change="Servings"
              period="to feed people"
              icon="🍽️"
              trend="neutral"
            />
            <StatsCard
              title="Your Claims"
              value={myClaims.length}
              change="This month"
              period="total claimed"
              icon="📦"
              trend="neutral"
            />
          </div>

          <div className="food-items-section">
            <div className="section-header">
              <h3>Food Items</h3>
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Items ({foodItems.length})
                </button>
                <button 
                  className={`tab ${activeTab === 'donations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('donations')}
                >
                  Donations ({donationItems.length})
                </button>
                <button 
                  className={`tab ${activeTab === 'myClaims' ? 'active' : ''}`}
                  onClick={() => setActiveTab('myClaims')}
                >
                  My Claims ({myClaims.length})
                </button>
              </div>
            </div>
            
            {loading ? (
              <p>Loading...</p>
            ) : activeTab === 'myClaims' ? (
              // Display Claims
              myClaims.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't claimed any donations yet.</p>
                  <p>Browse the Donations tab to claim food items!</p>
                </div>
              ) : (
                <div className="claims-list">
                  {myClaims.map((claim) => (
                    <div key={claim.id} className="claim-card">
                      <div className="claim-header">
                        <h4>{claim.foodItemName}</h4>
                        <span className={`status-badge ${claim.status.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </div>
                      <div className="claim-details">
                        <p><strong>Store:</strong> {claim.storeName}</p>
                        <p><strong>Quantity Claimed:</strong> {claim.quantityClaimed} units</p>
                        <p><strong>Claimed On:</strong> {new Date(claim.createdAt).toLocaleDateString()}</p>
                        {claim.ngoMessage && (
                          <p><strong>Your Message:</strong> {claim.ngoMessage}</p>
                        )}
                        {claim.storeResponse && (
                          <p><strong>Store Response:</strong> {claim.storeResponse}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <p>No {activeTab === 'donations' ? 'donation' : ''} items available at the moment.</p>
                <p>Check back soon!</p>
              </div>
            ) : (
              <div className="food-items-grid">
                {filteredItems.map((item) => (
                  <div key={item.id} className="food-item-card">
                    <div className="item-header">
                      <h4>{item.name}</h4>
                      {item.isDonation && <span className="free-badge">FREE DONATION</span>}
                      {!item.isDonation && (
                        <span className="price-badge">${item.currentPrice}</span>
                      )}
                    </div>
                    
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="item-image" />
                    )}
                    
                    <p className="item-description">{item.description}</p>
                    
                    <div className="item-details">
                      <div className="detail-row">
                        <span className="label">Quantity:</span>
                        <span className="value">{item.quantity} units</span>
                      </div>
                      {!item.isDonation && (
                        <>
                          <div className="detail-row">
                            <span className="label">Original:</span>
                            <span className="value strike">${item.originalPrice}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Discount:</span>
                            <span className="value green">{item.discountPercentage}% OFF</span>
                          </div>
                        </>
                      )}
                      {item.isDonation && (
                        <div className="detail-row">
                          <span className="label">Value:</span>
                          <span className="value">${item.originalPrice}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="label">Expires:</span>
                        <span className="value">{new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Store:</span>
                        <span className="value">{item.storeManagerName}</span>
                      </div>
                    </div>
                    
                    {item.isDonation ? (
                      <button 
                        className="btn-claim"
                        onClick={() => openClaimModal(item)}
                        disabled={item.quantity === 0}
                      >
                        {item.quantity === 0 ? 'Sold Out' : 'Claim for Free'}
                      </button>
                    ) : (
                      <button className="btn-view" disabled>
                        For Purchase Only
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Claim Donation Modal */}
      {selectedItem && (
        <ClaimDonationModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          foodItem={selectedItem}
          onClaim={handleClaimDonation}
        />
      )}
    </div>
  )
}

export default NGODashboard
