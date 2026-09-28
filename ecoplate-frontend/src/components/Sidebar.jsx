import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  MdDashboard, 
  MdShoppingCart, 
  MdInventory, 
  MdLocalShipping,
  MdFavorite, 
  MdMessage, 
  MdSettings,
  MdCardGiftcard,
  MdAssignment,
  MdBarChart,
  MdPeople,
  MdLogout
} from 'react-icons/md'
import '../styles/Sidebar.css'

const Sidebar = ({ onLogout, userRole = 'STORE_MANAGER' }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const getMenuItems = () => {
    switch(userRole) {
      case 'STORE_MANAGER':
        return [
          { icon: <MdDashboard />, label: 'Overview', path: '/dashboard' },
          { icon: <MdInventory />, label: 'My Listings', path: '/listings' },
          { icon: <MdLocalShipping />, label: 'Orders', path: '/store-orders' },
          { icon: <MdBarChart />, label: 'Analytics', path: '/analytics' },
          { icon: <MdPeople />, label: 'Recipients', path: '/recipients' },
          { icon: <MdMessage />, label: 'Notifications', path: '/messages' },
          { icon: <MdSettings />, label: 'Settings', path: '/settings' }
        ]
      case 'CUSTOMER':
        return [
          { icon: <MdShoppingCart />, label: 'Browse Food', path: '/dashboard' },
          { icon: <MdAssignment />, label: 'My Orders', path: '/orders' },
          { icon: <MdFavorite />, label: 'Favorites', path: '/favorites' },
          { icon: <MdMessage />, label: 'Notifications', path: '/messages' },
          { icon: <MdSettings />, label: 'Settings', path: '/settings' }
        ]
      case 'NGO':
        return [
          { icon: <MdCardGiftcard />, label: 'Available Donations', path: '/dashboard' },
          { icon: <MdInventory />, label: 'My Claims', path: '/claims' },
          { icon: <MdBarChart />, label: 'Impact Report', path: '/impact' },
          { icon: <MdMessage />, label: 'Notifications', path: '/messages' },
          { icon: <MdSettings />, label: 'Settings', path: '/settings' }
        ]
      default:
        return [
          { icon: <MdDashboard />, label: 'Overview', path: '/dashboard' },
          { icon: <MdSettings />, label: 'Settings', path: '/settings' }
        ]
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#10B981"/>
            <path d="M24 12C18.477 12 14 16.477 14 22C14 27.523 18.477 32 24 32C29.523 32 34 27.523 34 22C34 16.477 29.523 12 24 12Z" fill="white"/>
          </svg>
        </div>
        <span className="sidebar-title">EcoPlate</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span className="nav-icon"><MdLogout /></span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
