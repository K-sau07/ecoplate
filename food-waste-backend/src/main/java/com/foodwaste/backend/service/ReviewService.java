package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.ReviewRequest;
import com.foodwaste.backend.dto.ReviewResponse;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.*;
import com.foodwaste.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    // create a review for a food item
    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // check if customer is actually a customer
        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new IllegalArgumentException("Only customers can write reviews");
        }

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        // check if customer has purchased this item
        boolean hasPurchased = orderRepository.existsByCustomerIdAndFoodItemIdAndStatus(
                customer.getId(),
                foodItem.getId(),
                OrderStatus.COMPLETED);

        if (!hasPurchased) {
            throw new IllegalArgumentException("You can only review items you have purchased");
        }

        // check if customer already reviewed this item
        if (reviewRepository.existsByFoodItemIdAndCustomerId(foodItem.getId(), customer.getId())) {
            throw new IllegalArgumentException("You have already reviewed this item");
        }

        Review review = Review.builder()
                .foodItem(foodItem)
                .customer(customer)
                .rating(request.getRating())
                .reviewText(request.getReviewText())
                .likesCount(0)
                .build();

        review = reviewRepository.save(review);

        return mapToResponse(review, customer.getId());
    }

    // get all reviews for a food item
    public List<ReviewResponse> getReviewsForFoodItem(Long foodItemId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = null;

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            User user = userRepository.findByEmail(auth.getName()).orElse(null);
            if (user != null) {
                currentUserId = user.getId();
            }
        }

        List<Review> reviews = reviewRepository.findByFoodItemIdOrderByLikesCountDesc(foodItemId);

        final Long userId = currentUserId;
        return reviews.stream()
                .map(review -> mapToResponse(review, userId))
                .collect(Collectors.toList());
    }

    // toggle like on a review
    @Transactional
    public ReviewResponse toggleLike(Long reviewId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        boolean alreadyLiked = reviewLikeRepository.existsByReviewIdAndCustomerId(reviewId, customer.getId());

        if (alreadyLiked) {
            // unlike
            reviewLikeRepository.deleteByReviewIdAndCustomerId(reviewId, customer.getId());
            review.setLikesCount(review.getLikesCount() - 1);
        } else {
            // like
            ReviewLike like = ReviewLike.builder()
                    .review(review)
                    .customer(customer)
                    .build();
            reviewLikeRepository.save(like);
            review.setLikesCount(review.getLikesCount() + 1);
        }

        review = reviewRepository.save(review);

        return mapToResponse(review, customer.getId());
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Verify ownership
        if (!review.getCustomer().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only edit your own reviews");
        }

        // Update fields
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        review = reviewRepository.save(review);

        return mapToResponse(review, currentUser.getId());
    }

    // NEW: Delete a review
    @Transactional
    public void deleteReview(Long reviewId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Verify ownership
        if (!review.getCustomer().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only delete your own reviews");
        }

        // Delete associated likes first to prevent Foreign Key errors
        reviewLikeRepository.deleteAllByReviewId(reviewId);

        // Delete the review
        reviewRepository.delete(review);
    }

    // helper method to convert review to response
    private ReviewResponse mapToResponse(Review review, Long currentUserId) {
        boolean likedByUser = false;

        if (currentUserId != null) {
            likedByUser = reviewLikeRepository.existsByReviewIdAndCustomerId(review.getId(), currentUserId);
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .foodItemId(review.getFoodItem().getId())
                .foodItemName(review.getFoodItem().getItemName())
                .customerId(review.getCustomer().getId())
                .customerFirstName(review.getCustomer().getFirstName())
                .customerLastName(review.getCustomer().getLastName())
                .rating(review.getRating())
                .comment(review.getReviewText() != null ? review.getReviewText() : "")
                .likesCount(review.getLikesCount())
                .likedByCurrentUser(likedByUser)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
