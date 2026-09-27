package com.foodwaste.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodItemRequest {
    
    @NotBlank(message = "Food item name is required")
    private String name;
    
    private String description;
    
    private String imageUrl;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @NotBlank(message = "Unit is required")
    private String unit;
    
    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal originalPrice;
    
    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    private LocalDateTime expiryDate;
}