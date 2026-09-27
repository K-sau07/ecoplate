import React, { useState } from 'react';
import '../styles/Modal.css';

/**
 * ClaimDonationModal Component
 * Modal for NGOs to claim food donations
 */
const ClaimDonationModal = ({ isOpen, onClose, foodItem, onClaim }) => {
  const [quantityClaimed, setQuantityClaimed] = useState(1);
  const [ngoMessage, setNgoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (quantityClaimed < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantityClaimed > foodItem.quantity) {
      setError(`Maximum available quantity is ${foodItem.quantity}`);
      return;
    }

    setLoading(true);
    try {
      await onClaim({
        foodItemId: foodItem.id,
        quantityClaimed: parseInt(quantityClaimed),
        ngoMessage: ngoMessage.trim()
      });
      onClose();
      // Reset form
      setQuantityClaimed(1);
      setNgoMessage('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to claim donation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Claim Food Donation</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="food-item-summary">
            <h3>{foodItem.name}</h3>
            <p className="store-name">From: {foodItem.storeManagerName}</p>
            <p className="item-description">{foodItem.description}</p>
            <div className="item-info">
              <span>📦 Available: {foodItem.quantity} units</span>
              <span>📅 Expires: {new Date(foodItem.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="quantity">Quantity to Claim *</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={foodItem.quantity}
                value={quantityClaimed}
                onChange={(e) => setQuantityClaimed(e.target.value)}
                required
                disabled={loading}
              />
              <small>Maximum: {foodItem.quantity} units</small>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message to Store (Optional)</label>
              <textarea
                id="message"
                rows="4"
                placeholder="Let the store know how you plan to use this donation..."
                value={ngoMessage}
                onChange={(e) => setNgoMessage(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Claiming...' : 'Claim Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClaimDonationModal;
