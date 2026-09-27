import { useState, useEffect } from 'react'
import ReviewForm from './ReviewForm'
import ReviewSection from './ReviewSection'
import '../styles/Reviews.css'

function ReviewModal({ foodItem, currentUserId, onClose }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleReviewSubmitted = () => {
    // Trigger refresh of reviews list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Reviews for {foodItem.name}</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="review-modal-content">
          <ReviewForm 
            foodItemId={foodItem.id} 
            onReviewSubmitted={handleReviewSubmitted}
          />
          
          <ReviewSection 
            key={refreshTrigger}
            foodItemId={foodItem.id}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
