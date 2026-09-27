package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {

    Optional<ReviewLike> findByReviewIdAndCustomerId(Long reviewId, Long customerId);

    boolean existsByReviewIdAndCustomerId(Long reviewId, Long customerId);

    void deleteByReviewIdAndCustomerId(Long reviewId, Long customerId);

    void deleteAllByReviewId(Long reviewId);
}
