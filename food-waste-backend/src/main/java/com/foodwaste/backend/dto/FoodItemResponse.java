package com.foodwaste.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItemResponse {
    
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private String category;
    private Integer quantity;
    private String unit;
    private BigDecimal originalPrice;
    private BigDecimal currentPrice;
    private Integer discountPercentage;
    private LocalDateTime expiryDate;
    private String status;
    private Boolean isDonation;
    private Long storeManagerId;
    private String storeManagerName;
    private String storeName;
    private Double storeLatitude;
    private Double storeLongitude;
    private String storeAddress;
    private LocalDateTime createdAt;
}