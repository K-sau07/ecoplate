import '../styles/PaymentModal.css'

const OrderSuccessModal = ({ isOpen, onClose, payment }) => {
  if (!isOpen) return null

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal success-modal" onClick={e => e.stopPropagation()}>
        <div className="success-content">
          <div className="success-icon">
            ✅
          </div>
          <h2>Payment Successful!</h2>
          <p className="success-message">Your order has been confirmed and paid.</p>

          <div className="payment-details">
            <div className="detail-row">
              <span>Transaction ID:</span>
              <span className="transaction-id">{payment.transactionId}</span>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span className="amount-paid">${payment.amount}</span>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>•••• {payment.cardLastFour} ({payment.cardType})</span>
            </div>
            <div className="detail-row">
              <span>Order Status:</span>
              <span className="status-paid">PAID ✓</span>
            </div>
          </div>

          <div className="success-notice">
            📧 A receipt has been sent to your email
          </div>

          <button className="btn-close-success" onClick={onClose}>
            View My Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessModal
