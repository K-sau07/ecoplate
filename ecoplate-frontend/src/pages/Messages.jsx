import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function Messages() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole={user?.role || "CUSTOMER"} />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="page-title">
            <h1>Messages</h1>
            <p>Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
