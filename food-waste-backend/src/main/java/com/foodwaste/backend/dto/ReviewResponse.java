package com.foodwaste.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private Long customerId;
    private String customerFirstName;
    private String customerLastName;
    private Integer rating;
    private String comment;
    private Integer likesCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
}
