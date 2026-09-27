package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByFoodItemIdOrderByLikesCountDesc(Long foodItemId);
    
    Optional<Review> findByFoodItemIdAndCustomerId(Long foodItemId, Long customerId);
    
    boolean existsByFoodItemIdAndCustomerId(Long foodItemId, Long customerId);
}
