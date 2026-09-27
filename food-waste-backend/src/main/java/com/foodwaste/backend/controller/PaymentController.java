package com.foodwaste.backend.controller;

import com.foodwaste.backend.dto.PaymentRequest;
import com.foodwaste.backend.dto.PaymentResponse;
import com.foodwaste.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.foodwaste.backend.model.User;
import com.foodwaste.backend.repository.UserRepository;
import com.foodwaste.backend.exception.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentService paymentService;
    private final UserRepository userRepository;
    
    /**
     * Process payment for an order (Customer/NGO)
     */
    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'NGO')")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }
    
    /**
     * Get payment details for an order
     */
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'NGO', 'STORE_MANAGER')")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }
    
    /**
     * Get all payments for store manager
     */
    @GetMapping("/store")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<List<PaymentResponse>> getStorePayments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User store = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return ResponseEntity.ok(paymentService.getStorePayments(store.getId()));
    }
    
    /**
     * Get all payments for customer
     */
    @GetMapping("/my-payments")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'NGO')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return ResponseEntity.ok(paymentService.getCustomerPayments(customer.getId()));
    }
}
