package com.foodwaste.backend.model;

public enum NotificationType {
    INFO, // General updates
    WARNING, // Expiry warnings
    SUCCESS, // Order completions/Claims
    ALERT // Urgent actions needed
}