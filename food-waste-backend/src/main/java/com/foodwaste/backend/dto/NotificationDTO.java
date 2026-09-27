package com.foodwaste.backend.dto;

import com.foodwaste.backend.model.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private Long id;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private Long relatedEntityId; // e.g., FoodItem ID or Order ID
    private LocalDateTime createdAt;
}