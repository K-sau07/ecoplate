package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.Payment;
import com.foodwaste.backend.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Find payment by order ID
    Optional<Payment> findByOrderId(Long orderId);
    
    // Find payment by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Find all payments for a store manager's food items
    @Query("SELECT p FROM Payment p WHERE p.order.foodItem.store.id = :storeId ORDER BY p.createdAt DESC")
    List<Payment> findByStoreId(@Param("storeId") Long storeId);
    
    // Find payments by status for a store
    @Query("SELECT p FROM Payment p WHERE p.order.foodItem.store.id = :storeId AND p.status = :status ORDER BY p.createdAt DESC")
    List<Payment> findByStoreIdAndStatus(@Param("storeId") Long storeId, @Param("status") PaymentStatus status);
    
    // Find all payments for a customer
    @Query("SELECT p FROM Payment p WHERE p.order.customer.id = :customerId ORDER BY p.createdAt DESC")
    List<Payment> findByCustomerId(@Param("customerId") Long customerId);
}
