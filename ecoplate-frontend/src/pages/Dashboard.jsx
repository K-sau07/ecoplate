import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatsCard from '../components/StatsCard'
import CreateFoodItemModal from '../components/CreateFoodItemModal'
import NotificationBadge from '../components/NotificationBadge'
import { foodItemService } from '../services/api'
import '../styles/Dashboard.css'

const Dashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [foodItems, setFoodItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

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
            const items = await foodItemService.getMyItems()
            setFoodItems(items)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching items:', error)
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const stats = {
        mealsSaved: 2847,
        co2Reduced: 1.2,
        activeRecipients: 48,
        valueSaved: 12450
    }

    const weeklyData = [
        { day: 'Mon', saved: 45, wasted: 12 },
        { day: 'Tue', saved: 52, wasted: 8 },
        { day: 'Wed', saved: 38, wasted: 15 },
        { day: 'Thu', saved: 67, wasted: 6 },
        { day: 'Fri', saved: 78, wasted: 4 },
        { day: 'Sat', saved: 48, wasted: 10 },
        { day: 'Sun', saved: 56, wasted: 9 }
    ]

    const recentActivity = [
        { title: 'Fresh Prod...', status: 'completed', recipient: 'Community Kitchen', time: '2 hours ago', amount: '45 lbs' },
        { title: 'Bread & P...', status: 'completed', recipient: 'Hope Shelter', time: '5 hours ago', amount: '30 items' },
        { title: 'Prepared ...', status: 'completed', recipient: 'Food Bank Network', time: '1 day ago', amount: '80 meals' }
    ]

    return (
        <div className="dashboard-container">
            <Sidebar onLogout={handleLogout} userRole="STORE_MANAGER" />

            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div className="search-bar">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input type="text" placeholder="Search donations, recipients..." />
                    </div>

                    <div className="header-actions">
                        <button className="new-listing-btn" onClick={() => setIsModalOpen(true)}>
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
                        <h1>Dashboard Overview</h1>
                        <p>Welcome back! Here's what's happening with your food rescue efforts.</p>
                    </div>

                    <div className="stats-grid">
                        <StatsCard
                            title="Meals Saved"
                            value={stats.mealsSaved.toLocaleString()}
                            change="+12.5%"
                            period="vs last month"
                            icon="🍽️"
                            trend="up"
                        />
                        <StatsCard
                            title="CO₂ Reduced"
                            value={`${stats.co2Reduced} tons`}
                            change="+8.3%"
                            period="vs last month"
                            icon="🌱"
                            trend="up"
                        />
                        <StatsCard
                            title="Active Recipients"
                            value={stats.activeRecipients}
                            change="+4"
                            period="vs last month"
                            icon="👥"
                            trend="up"
                        />
                        <StatsCard
                            title="Value Saved"
                            value={`$${stats.valueSaved.toLocaleString()}`}
                            change="+15.2%"
                            period="vs last month"
                            icon="💵"
                            trend="up"
                        />
                    </div>

                    <div className="dashboard-grid">
                        <div className="chart-card">
                            <h3>Weekly Performance</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {weeklyData.map((data, index) => (
                                        <div key={index} className="bar-group">
                                            <div className="bar-container">
                                                <div className="bar saved" style={{ height: `${data.saved}%` }}></div>
                                                <div className="bar wasted" style={{ height: `${data.wasted}%` }}></div>
                                            </div>
                                            <span className="bar-label">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="activity-card">
                            <h3>Recent Activity</h3>
                            <div className="activity-list">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-icon">
                                            <span className="status-dot completed"></span>
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-title">{activity.title}</div>
                                            <div className="activity-subtitle">{activity.recipient}</div>
                                            <div className="activity-time">{activity.time}</div>
                                        </div>
                                        <div className="activity-amount">{activity.amount}</div>
                                        <span className="activity-status">{activity.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CreateFoodItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchFoodItems}
            />
        </div>
    )
}

export default Dashboard