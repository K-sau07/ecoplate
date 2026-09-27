package com.foodwaste.backend.dto;

import com.foodwaste.backend.model.FoodItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodItemDTO {
    
    private Long id;
    
    @NotBlank(message = "Item name is required")
    private String itemName;
    
    private String description;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    @NotNull(message = "Original price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal originalPrice;
    
    private BigDecimal currentPrice;
    
    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;
    
    private FoodItemStatus status;
    
    private Long storeId;
    private String storeName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}