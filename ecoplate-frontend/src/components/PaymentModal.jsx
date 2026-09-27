import { useState } from 'react'
import { API_BASE_URL } from '../services/api'
import '../styles/PaymentModal.css'

const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(' ') : cleaned
  }

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '')
      if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
        formattedValue = formatCardNumber(cleaned)
      } else {
        return
      }
    } else if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length <= 4) {
        formattedValue = formatExpiryDate(cleaned)
      } else {
        return
      }
    } else if (name === 'cvv') {
      if (value.length <= 4 && /^\d*$/.test(value)) {
        formattedValue = value
      } else {
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const cleaned = formData.cardNumber.replace(/\s/g, '')
      
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.id,
          cardNumber: cleaned,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardholderName: formData.cardholderName,
          paymentMethod: 'CARD'
        })
      })

      const data = await response.json()

      if (data.success) {
        onPaymentSuccess(data)
      } else {
        setError(data.message || 'Payment failed. Please try again.')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCardType = () => {
    const cleaned = formData.cardNumber.replace(/\s/g, '')
    if (cleaned.startsWith('4')) return '💳 Visa'
    if (cleaned.startsWith('5')) return '💳 Mastercard'
    if (cleaned.startsWith('3')) return '💳 Amex'
    return '💳 Card'
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={e => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>💳 Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-summary">
          <div className="summary-row">
            <span>Item:</span>
            <span>{order.foodItemName}</span>
          </div>
          <div className="summary-row">
            <span>Quantity:</span>
            <span>{order.quantity}x</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span className="amount">${order.totalPrice}</span>
          </div>
        </div>

        {error && (
          <div className="payment-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Card Number</label>
            <div className="card-input-wrapper">
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                required
                maxLength="19"
              />
              <span className="card-type">{getCardType()}</span>
            </div>
            <div className="input-hint">Test: 4111 1111 1111 1111 (success) or 4000 0000 0000 0002 (fail)</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                required
                maxLength="5"
              />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                required
                maxLength="4"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="payment-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-pay" disabled={loading}>
              {loading ? '⏳ Processing...' : `Pay $${order.totalPrice}`}
            </button>
          </div>

          <div className="secure-notice">
            🔒 Secure Payment • Your data is encrypted
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
