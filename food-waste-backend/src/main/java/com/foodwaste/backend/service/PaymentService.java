package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.PaymentRequest;
import com.foodwaste.backend.dto.PaymentResponse;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.*;
import com.foodwaste.backend.repository.FoodItemRepository;
import com.foodwaste.backend.repository.OrderRepository;
import com.foodwaste.backend.repository.PaymentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    /**
     * Process payment for an order (MOCK IMPLEMENTATION)
     * This simulates payment processing without real payment gateway
     */
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        // 1. Get the order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // 2. Validate order state
        if (order.getIsPaid()) {
            throw new IllegalStateException("Order is already paid");
        }
        
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order must be confirmed by store before payment. Current status: " + order.getStatus());
        }
        
        // 3. Check if payment already exists
        var existingPaymentOpt = paymentRepository.findByOrderId(order.getId());
        if (existingPaymentOpt.isPresent()) {
            Payment existingPayment = existingPaymentOpt.get();
            
            // If successful payment exists, throw error
            if (existingPayment.getStatus() == PaymentStatus.SUCCESS) {
                throw new IllegalStateException("Order is already paid successfully");
            }
            
            // If failed or pending payment exists, delete it to allow retry
            paymentRepository.delete(existingPayment);
            paymentRepository.flush();  // Flush the delete immediately
        }
        
        // 4. MOCK PAYMENT PROCESSING
        // Simulate payment gateway with 90% success rate
        boolean paymentSuccess = simulatePaymentGateway(request.getCardNumber());
        
        // 5. Generate transaction ID
        String transactionId = generateTransactionId();
        
        // 6. Extract card details (clean the card number first)
        String cleanedCardNumber = request.getCardNumber().replaceAll("[^0-9]", "");
        String cardLastFour = cleanedCardNumber.substring(cleanedCardNumber.length() - 4);
        String cardType = detectCardType(cleanedCardNumber);
        
        // 7. Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .transactionId(transactionId)
                .amount(order.getTotalPrice())
                .paymentMethod(request.getPaymentMethod())
                .cardLastFour(cardLastFour)
                .cardType(cardType)
                .cardholderName(request.getCardholderName())
                .status(paymentSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED)
                .failureReason(paymentSuccess ? null : generateFailureReason())
                .completedAt(LocalDateTime.now())
                .build();
        
        payment = paymentRepository.save(payment);
        
        // 8. If payment successful, update order and reduce inventory
        if (paymentSuccess) {
            // Update order
            order.setIsPaid(true);
            order.setStatus(OrderStatus.PAID);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            
            // Reduce inventory (NOW, after payment!)
            FoodItem foodItem = order.getFoodItem();
            int newQuantity = foodItem.getQuantity() - order.getQuantity();
            foodItem.setQuantity(newQuantity);
            
            // Update food item status if out of stock
            if (newQuantity == 0) {
                foodItem.setStatus(FoodItemStatus.CLAIMED);
            }
            foodItemRepository.save(foodItem);
        }
        
        // 9. Return response
        return convertToResponse(payment, paymentSuccess);
    }
    
    /**
     * MOCK: Simulate payment gateway
     * Returns true for success, false for failure
     */
    private boolean simulatePaymentGateway(String cardNumber) {
        // Test cards for demo
        if (cardNumber.equals("4111111111111111")) {
            return true;  // Always success
        }
        if (cardNumber.equals("4000000000000002")) {
            return false; // Always fail
        }
        
        // Random success/failure (90% success rate)
        return Math.random() < 0.9;
    }
    
    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + ((int)(Math.random() * 1000));
    }
    
    /**
     * Detect card type from card number
     */
    private String detectCardType(String cardNumber) {
        // Clean the card number (remove spaces and special characters)
        String cleanedNumber = cardNumber.replaceAll("[^0-9]", "");
        
        if (cleanedNumber.isEmpty()) {
            return "CARD";
        }
        
        char firstDigit = cleanedNumber.charAt(0);
        
        if (firstDigit == '4') {
            return "VISA";
        } else if (firstDigit == '5') {
            return "MASTERCARD";
        } else if (firstDigit == '3') {
            return "AMEX";
        } else if (firstDigit == '6') {
            return "DISCOVER";
        }
        
        // For any other card (including cards starting with 1, 2, 7, 8, 9)
        return "CARD";
    }
    
    /**
     * Generate mock failure reason
     */
    private String generateFailureReason() {
        String[] reasons = {
            "Insufficient funds",
            "Card expired",
            "Invalid CVV",
            "Bank declined transaction",
            "Card limit exceeded"
        };
        return reasons[(int)(Math.random() * reasons.length)];
    }
    
    /**
     * Get payment by order ID
     */
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));
        
        return convertToResponse(payment, payment.getStatus() == PaymentStatus.SUCCESS);
    }
    
    /**
     * Get all payments for store manager
     */
    public List<PaymentResponse> getStorePayments(Long storeId) {
        List<Payment> payments = paymentRepository.findByStoreId(storeId);
        return payments.stream()
                .map(p -> convertToResponse(p, p.getStatus() == PaymentStatus.SUCCESS))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all payments for customer
     */
    public List<PaymentResponse> getCustomerPayments(Long customerId) {
        List<Payment> payments = paymentRepository.findByCustomerId(customerId);
        return payments.stream()
                .map(p -> convertToResponse(p, p.getStatus() == PaymentStatus.SUCCESS))
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Payment entity to PaymentResponse DTO
     */
    private PaymentResponse convertToResponse(Payment payment, boolean success) {
        Order order = payment.getOrder();
        
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .cardLastFour(payment.getCardLastFour())
                .cardType(payment.getCardType())
                .status(payment.getStatus().toString())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getCompletedAt())
                .customerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName())
                .customerEmail(order.getCustomer().getEmail())
                .itemName(order.getFoodItem().getItemName())
                .quantity(order.getQuantity())
                .success(success)
                .message(success ? "Payment successful" : "Payment failed: " + payment.getFailureReason())
                .build();
    }
}
