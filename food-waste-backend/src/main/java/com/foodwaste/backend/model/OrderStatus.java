package com.foodwaste.backend.model;

public enum OrderStatus {
    PENDING,      // Order placed, waiting for store confirmation
    CONFIRMED,    // Store confirmed the order, awaiting payment
    PAID,         // Customer paid, order being prepared
    READY,        // Order is ready for pickup/delivery
    COMPLETED,    // Order completed successfully
    CANCELLED     // Order was cancelled
}
