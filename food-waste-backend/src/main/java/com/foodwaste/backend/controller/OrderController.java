package com.foodwaste.backend.controller;

import com.foodwaste.backend.dto.OrderRequest;
import com.foodwaste.backend.dto.OrderResponse;
import com.foodwaste.backend.model.OrderStatus;
import com.foodwaste.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    // CUSTOMER/NGO APIs
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'NGO')")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }
    
    @GetMapping("/my-customer-orders")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'NGO')")
    public ResponseEntity<List<OrderResponse>> getMyCustomerOrders() {
        return ResponseEntity.ok(orderService.getMyCustomerOrders());
    }
    
    // STORE MANAGER APIs
    
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(orderService.getOrdersByStatus(orderStatus));
    }
    
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        OrderStatus newStatus = OrderStatus.valueOf(request.get("status").toUpperCase());
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, newStatus));
    }
    
    @PutMapping("/{orderId}/notes")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<OrderResponse> addStoreNotes(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(orderService.addStoreNotes(orderId, request.get("notes")));
    }
    
    @PostMapping("/{orderId}/accept")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<OrderResponse> acceptOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.acceptOrder(orderId));
    }
    
    @PostMapping("/{orderId}/reject")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<OrderResponse> rejectOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String reason = request.getOrDefault("reason", "Order rejected by store");
        return ResponseEntity.ok(orderService.rejectOrder(orderId, reason));
    }
}
