import { useState } from 'react'
import { reviewService } from '../services/reviewService'
import { toast } from 'react-toastify'
import '../styles/Reviews.css'

function ReviewForm({ foodItemId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (!comment.trim()) {
      toast.error('Please write a review')
      return
    }

    setSubmitting(true)
    try {
      await reviewService.createReview({
        foodItemId,
        rating,
        comment: comment.trim()
      })
      
      toast.success('Review submitted successfully!')
      setRating(0)
      setComment('')
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star-btn ${star <= (hoveredRating || rating) ? 'active' : ''}`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
      >
        ⭐
      </button>
    ))
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      
      <div className="rating-input">
        <label>Your Rating:</label>
        <div className="stars-container">
          {renderStars()}
          {rating > 0 && (
            <span className="rating-text">{rating} out of 5</span>
          )}
        </div>
      </div>

      <div className="comment-input">
        <label>Your Review:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this food item..."
          rows="4"
          maxLength="500"
        />
        <div className="char-count">{comment.length}/500</div>
      </div>

      <button 
        type="submit" 
        className="submit-review-btn"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

export default ReviewForm
