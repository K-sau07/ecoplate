package com.foodwaste.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Link to order (one-to-one relationship)
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
    
    // Transaction details
    @Column(nullable = false, unique = true, length = 50)
    private String transactionId;  // Generated: "TXN" + timestamp
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    // Payment method details (mock data for demo)
    @Column(nullable = false, length = 20)
    private String paymentMethod;  // "CARD", "UPI", "WALLET"
    
    @Column(length = 4)
    private String cardLastFour;   // Last 4 digits: "3456"
    
    @Column(length = 20)
    private String cardType;       // "VISA", "MASTERCARD", "AMEX"
    
    @Column(length = 100)
    private String cardholderName;
    
    // Payment status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Column(length = 255)
    private String failureReason;  // Reason if payment failed
    
    // Timestamps
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime completedAt;  // When payment succeeded/failed
}
