package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.Order;
import com.foodwaste.backend.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find all orders for a specific store manager's food items
    @Query("SELECT o FROM Order o WHERE o.foodItem.store.id = :storeId ORDER BY o.createdAt DESC")
    List<Order> findByStoreId(@Param("storeId") Long storeId);
    
    // Find orders by customer
    List<Order> findByCustomerId(Long customerId);
    
    // Find orders by status for a store
    @Query("SELECT o FROM Order o WHERE o.foodItem.store.id = :storeId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByStoreIdAndStatus(@Param("storeId") Long storeId, @Param("status") OrderStatus status);
    
    // Check if customer has completed order for specific food item
    boolean existsByCustomerIdAndFoodItemIdAndStatus(Long customerId, Long foodItemId, OrderStatus status);
}
