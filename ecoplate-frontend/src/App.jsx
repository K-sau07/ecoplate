import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import MyListings from './pages/MyListings'
import Orders from './pages/Orders'
import MyOrders from './pages/MyOrders'
import Favorites from './pages/Favorites'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import Recipients from './pages/Recipients'
import MyClaims from './pages/MyClaims'
import CustomerDashboard from './pages/CustomerDashboard'
import NGODashboard from './pages/NGODashboard'
import StoreProfileSetup from './pages/StoreProfileSetup'

/**
 * Main application component with routing configuration.
 * Handles role-based routing to appropriate dashboards.
 */
function App() {
  /**
   * Route protection wrapper
   * Redirects to login if not authenticated
   */
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token')
    return token ? children : <Navigate to="/login" />
  }
  
  /**
   * Role-based dashboard router
   * Directs users to appropriate dashboard based on their role
   */
  const RoleDashboard = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))
    
    if (!user) return <Navigate to="/login" />
    
    switch(user.role) {
      case 'STORE_MANAGER':
        return <Dashboard />
      case 'CUSTOMER':
        return <CustomerDashboard />
      case 'NGO':
        return <NGODashboard />
      case 'ADMIN':
        return <Dashboard />
      default:
        return <Navigate to="/login" />
    }
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/listings" 
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/store-profile-setup" 
          element={
            <ProtectedRoute>
              <StoreProfileSetup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/store-orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recipients" 
          element={
            <ProtectedRoute>
              <Recipients />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/claims" 
          element={
            <ProtectedRoute>
              <MyClaims />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  )
}

export default App
