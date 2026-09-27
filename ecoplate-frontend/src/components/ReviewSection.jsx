import { useState, useEffect } from 'react'
import { reviewService } from '../services/reviewService'
import { toast } from 'react-toastify'
import '../styles/Reviews.css'

function ReviewSection({ foodItemId, currentUserId }) {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    // State for editing
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ rating: 5, comment: '' })

    useEffect(() => {
        loadReviews()
    }, [foodItemId])

    const loadReviews = async () => {
        try {
            const data = await reviewService.getReviewsForItem(foodItemId)
            setReviews(data)
        } catch (error) {
            console.error('Error loading reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async (reviewId) => {
        try {
            const updatedReview = await reviewService.toggleLike(reviewId)
            setReviews(reviews.map(review =>
                review.id === reviewId ? updatedReview : review
            ))
        } catch (error) {
            toast.error('Failed to update like')
        }
    }

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return

        try {
            await reviewService.deleteReview(reviewId)
            setReviews(reviews.filter(r => r.id !== reviewId))
            toast.success('Review deleted')
        } catch (error) {
            toast.error('Failed to delete review')
        }
    }

    const startEdit = (review) => {
        setEditingId(review.id)
        setEditForm({ rating: review.rating, comment: review.comment })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({ rating: 5, comment: '' })
    }

    const saveEdit = async (reviewId) => {
        try {
            // We need foodItemId for the DTO validation, even if it's not changed
            const updatedReview = await reviewService.updateReview(reviewId, {
                foodItemId,
                rating: editForm.rating,
                comment: editForm.comment
            })

            setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r))
            setEditingId(null)
            toast.success('Review updated!')
        } catch (error) {
            toast.error('Failed to update review')
        }
    }

    const renderStars = (rating, interactive = false) => {
        return (
            <div className="review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= (interactive ? editForm.rating : rating) ? 'filled' : ''}`}
                        style={interactive ? { cursor: 'pointer' } : {}}
                        onClick={() => interactive && setEditForm({ ...editForm, rating: star })}
                    >
                        ⭐
                    </span>
                ))}
            </div>
        )
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        })
    }

    if (loading) return <div className="reviews-loading">Loading reviews...</div>
    if (reviews.length === 0) return <div className="reviews-empty">No reviews yet.</div>

    return (
        <div className="reviews-section">
            <h3>Customer Reviews ({reviews.length})</h3>

            <div className="reviews-list">
                {reviews.map((review) => (
                    <div key={review.id} className="review-item">

                        {/* Header Section */}
                        <div className="review-header">
                            <div className="reviewer-info">
                                <div className="reviewer-avatar">
                                    {review.customerFirstName?.[0]}{review.customerLastName?.[0]}
                                </div>
                                <div className="reviewer-details">
                                    <span className="reviewer-name">
                                        {review.customerFirstName} {review.customerLastName}
                                    </span>
                                    <span className="review-date">{formatDate(review.createdAt)}</span>
                                </div>
                            </div>

                            {/* Show Stars (Editable or Read-Only) */}
                            {editingId === review.id
                                ? renderStars(review.rating, true)
                                : renderStars(review.rating)
                            }
                        </div>

                        {/* Content Section (Edit Mode vs View Mode) */}
                        {editingId === review.id ? (
                            <div className="edit-mode">
                                <textarea
                                    className="edit-textarea"
                                    value={editForm.comment}
                                    onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                    rows="3"
                                />
                                <div className="edit-actions">
                                    <button className="save-btn" onClick={() => saveEdit(review.id)}>Save</button>
                                    <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="review-comment">{review.comment}</div>
                        )}

                        {/* Footer Actions */}
                        <div className="review-actions">
                            <button
                                className={`like-btn ${review.likedByCurrentUser ? 'liked' : ''}`}
                                onClick={() => handleLike(review.id)}
                            >
                                {review.likedByCurrentUser ? '❤️' : '🤍'} {review.likesCount}
                            </button>

                            {/* Only show Edit/Delete if user owns the review and isn't currently editing */}
                            {/* NOTE: Ensure customerId types match (string vs number) */}
                            {String(review.customerId) === String(currentUserId) && editingId !== review.id && (
                                <div className="owner-actions">
                                    <button className="action-link" onClick={() => startEdit(review)}>Edit</button>
                                    <button className="action-link delete" onClick={() => handleDelete(review.id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ReviewSection