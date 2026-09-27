import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '../services/api'
import '../styles/Modal.css'

function EditFoodItemModal({ isOpen, onClose, onSuccess, item }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'VEGETABLES',
    quantity: '',
    unit: 'pieces',
    originalPrice: '',
    expiryDate: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      // Convert ISO date to datetime-local format
      const expiryDateTime = new Date(item.expiryDate).toISOString().slice(0, 16)
      
      setFormData({
        name: item.name,
        description: item.description,
        category: 'VEGETABLES',
        quantity: item.quantity,
        unit: 'pieces',
        originalPrice: item.originalPrice,
        expiryDate: expiryDateTime
      })
    }
  }, [item])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        ...formData,
        imageUrl: formData.imageUrl || null
      }
      
      await axios.put(`${API_BASE_URL}/food-items/${item.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Food item updated successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error(error.response?.data?.message || 'Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Food Item</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Fresh Sandwich"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Describe your food item"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Original Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                required
                min="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Expiry Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditFoodItemModal
