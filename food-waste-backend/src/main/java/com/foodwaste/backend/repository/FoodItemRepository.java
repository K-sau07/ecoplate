package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.FoodItem;
import com.foodwaste.backend.model.FoodItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByStatus(FoodItemStatus status);
    List<FoodItem> findByExpiryDateBefore(LocalDate date);
    List<FoodItem> findByStoreId(Long storeId);
    List<FoodItem> findByStatusAndExpiryDateAfter(FoodItemStatus status, LocalDate date);
    List<FoodItem> findByIsDonationAndDeletedAndStatus(Boolean isDonation, Boolean deleted, FoodItemStatus status);
    List<FoodItem> findByStatusAndExpiryDateBetween(FoodItemStatus status, LocalDate start, LocalDate end);
}