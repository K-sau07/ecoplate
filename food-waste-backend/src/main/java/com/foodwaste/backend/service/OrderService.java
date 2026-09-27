package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.OrderRequest;
import com.foodwaste.backend.dto.OrderResponse;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.FoodItem;
import com.foodwaste.backend.model.NotificationType;
import com.foodwaste.backend.model.Order;
import com.foodwaste.backend.model.OrderStatus;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.repository.FoodItemRepository;
import com.foodwaste.backend.repository.OrderRepository;
import com.foodwaste.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final NotificationService notificationService;

    /**
     * Create a new order (Customer/NGO placing order)
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // Get the currently authenticated user (customer/NGO)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get the food item
        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        // Check if enough quantity available
        if (foodItem.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException(
                    "Not enough quantity available. Only " + foodItem.getQuantity() + " available.");
        }

        // Calculate total price
        BigDecimal totalPrice = foodItem.getCurrentPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        // Create order
        Order order = Order.builder()
                .foodItem(foodItem)
                .customer(customer)
                .quantity(request.getQuantity())
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .customerNotes(request.getCustomerNotes())
                .isPaid(false) // Order starts unpaid
                .build();

        order = orderRepository.save(order);

        String message = String.format("New Order! %s bought %d x %s",
                customer.getFirstName(),
                request.getQuantity(),
                foodItem.getItemName());

        notificationService.createNotification(
                foodItem.getStore(), // Notify Store Manager
                message,
                NotificationType.SUCCESS,
                order.getId());

        // NOTE: Inventory is NOT reduced here anymore!
        // It will be reduced AFTER payment is successful in PaymentService

        return convertToResponse(order);
    }

    /**
     * Get all orders for the current store manager's food items
     */
    public List<OrderResponse> getMyOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User store = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByStoreId(store.getId())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by status for the current store manager
     */
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User store = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByStoreIdAndStatus(store.getId(), status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update order status
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        // Set timestamps based on status
        if (newStatus == OrderStatus.CONFIRMED && order.getConfirmedAt() == null) {
            order.setConfirmedAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.COMPLETED && order.getCompletedAt() == null) {
            order.setCompletedAt(LocalDateTime.now());
        }

        order = orderRepository.save(order);
        return convertToResponse(order);
    }

    /**
     * Accept order (Store Manager)
     * Changes status from PENDING to CONFIRMED
     */
    @Transactional
    public OrderResponse acceptOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Validate current status
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING orders can be accepted. Current status: " + order.getStatus());
        }

        // Check if enough inventory is still available
        FoodItem foodItem = order.getFoodItem();
        if (foodItem.getQuantity() < order.getQuantity()) {
            throw new IllegalArgumentException(
                    "Not enough inventory available. Only " + foodItem.getQuantity() + " left.");
        }

        // Update order status
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        order = orderRepository.save(order);
        return convertToResponse(order);
    }

    /**
     * Reject order (Store Manager)
     * Changes status to CANCELLED
     */
    @Transactional
    public OrderResponse rejectOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Validate current status
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING orders can be rejected. Current status: " + order.getStatus());
        }

        // Update order status
        order.setStatus(OrderStatus.CANCELLED);
        order.setStoreNotes(reason);
        order.setUpdatedAt(LocalDateTime.now());

        order = orderRepository.save(order);
        return convertToResponse(order);
    }

    /**
     * Add store notes to an order
     */
    @Transactional
    public OrderResponse addStoreNotes(Long orderId, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStoreNotes(notes);
        order.setUpdatedAt(LocalDateTime.now());

        order = orderRepository.save(order);
        return convertToResponse(order);
    }

    /**
     * Get all orders for the current customer/NGO
     */
    public List<OrderResponse> getMyCustomerOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByCustomerId(customer.getId())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Order entity to OrderResponse DTO
     */
    private OrderResponse convertToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .foodItemId(order.getFoodItem().getId())
                .foodItemName(order.getFoodItem().getItemName())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName())
                .customerEmail(order.getCustomer().getEmail())
                .quantity(order.getQuantity())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().toString())
                .isPaid(order.getIsPaid()) // NEW: Include payment status
                .customerNotes(order.getCustomerNotes())
                .storeNotes(order.getStoreNotes())
                .createdAt(order.getCreatedAt())
                .confirmedAt(order.getConfirmedAt())
                .completedAt(order.getCompletedAt())
                .build();
    }
}
