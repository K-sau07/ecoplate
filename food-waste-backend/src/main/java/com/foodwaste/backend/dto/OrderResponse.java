package com.foodwaste.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Integer quantity;
    private BigDecimal totalPrice;
    private String status;
    private Boolean isPaid;  // NEW: Payment status
    private String customerNotes;
    private String storeNotes;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
}
