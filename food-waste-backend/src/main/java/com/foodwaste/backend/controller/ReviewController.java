package com.foodwaste.backend.controller;

import com.foodwaste.backend.dto.ReviewRequest;
import com.foodwaste.backend.dto.ReviewResponse;
import com.foodwaste.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    // create a new review
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // get all reviews for a food item
    @GetMapping("/food-item/{foodItemId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForFoodItem(@PathVariable Long foodItemId) {
        List<ReviewResponse> reviews = reviewService.getReviewsForFoodItem(foodItemId);
        return ResponseEntity.ok(reviews);
    }

    // toggle like on a review
    @PostMapping("/{reviewId}/like")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> toggleLike(@PathVariable Long reviewId) {
        ReviewResponse response = reviewService.toggleLike(reviewId);
        return ResponseEntity.ok(response);
    }

    // Update Review
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long id,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, request));
    }

    // Delete Review
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
