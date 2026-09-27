package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.FoodItemRequest;
import com.foodwaste.backend.dto.FoodItemResponse;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.FoodItem;
import com.foodwaste.backend.model.FoodItemStatus;
import com.foodwaste.backend.model.Store;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.repository.FoodItemRepository;
import com.foodwaste.backend.repository.OrderRepository;
import com.foodwaste.backend.repository.StoreRepository;
import com.foodwaste.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing food items.
 * Handles business logic for creating, retrieving, updating, and deleting food items.
 * Implements dynamic pricing based on expiry date.
 */
@Service
@RequiredArgsConstructor
public class FoodItemService {
    
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;
    
    /**
     * Creates a new food item for a store manager.
     * Automatically calculates discounted price based on expiry date.
     * 
     * @param request The food item request containing item details
     * @return FoodItemResponse containing the created food item
     * @throws ResourceNotFoundException if the authenticated user is not found
     */
    @Transactional
    public FoodItemResponse createFoodItem(FoodItemRequest request) {
        // Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find the store manager creating this item
        User store = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        
        // Build the food item entity
        FoodItem foodItem = FoodItem.builder()
                .itemName(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .originalPrice(request.getOriginalPrice())
                .currentPrice(calculateDiscountedPrice(request.getOriginalPrice(), request.getExpiryDate()))
                .expiryDate(LocalDate.from(request.getExpiryDate()))
                .status(FoodItemStatus.AVAILABLE)
                .store(store)
                .build();
        
        // Save to database
        foodItem = foodItemRepository.save(foodItem);
        
        // Convert to response DTO and return
        return convertToResponse(foodItem);
    }
    
    /**
     * Retrieves all available food items that have not expired and are not deleted.
     * 
     * @return List of available food items
     */
    public List<FoodItemResponse> getAllAvailableItems() {
        return foodItemRepository.findByStatusAndExpiryDateAfter(FoodItemStatus.AVAILABLE, LocalDate.now())
                .stream()
                .filter(item -> !item.getDeleted())  // Filter out soft-deleted items
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Retrieves food items by category.
     * Note: This implementation filters in-memory. For production, add a repository method.
     * 
     * @param category The category to filter by
     * @return List of food items in the specified category
     */
    public List<FoodItemResponse> getItemsByCategory(String category) {
        return foodItemRepository.findByStatusAndExpiryDateAfter(FoodItemStatus.AVAILABLE, LocalDate.now())
                .stream()
                .filter(item -> !item.getDeleted())  // Filter out soft-deleted items
                .filter(item -> item.getItemName().toLowerCase().contains(category.toLowerCase()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Retrieves all food items created by the currently authenticated store manager.
     * 
     * @return List of food items belonging to the current user
     * @throws ResourceNotFoundException if the authenticated user is not found
     */
    public List<FoodItemResponse> getMyFoodItems() {
        // Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find the user
        User store = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        
        // Return all items belonging to this store (including sold out items)
        return foodItemRepository.findByStoreId(store.getId())
                .stream()
                .filter(item -> !item.getDeleted())  // Filter out soft-deleted items only
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Retrieves a single food item by its ID.
     * 
     * @param id The ID of the food item
     * @return FoodItemResponse containing the food item details
     * @throws ResourceNotFoundException if the food item is not found
     */
    public FoodItemResponse getFoodItemById(Long id) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));
        return convertToResponse(foodItem);
    }
    
    /**
     * Updates an existing food item.
     * Only the store manager who created the item can update it.
     * 
     * @param id The ID of the food item to update
     * @param request The updated food item details
     * @return FoodItemResponse containing the updated food item
     * @throws ResourceNotFoundException if the food item is not found
     */
    @Transactional
    public FoodItemResponse updateFoodItem(Long id, FoodItemRequest request) {
        // Find the food item
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));
        
        // Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Verify the user owns this food item
        if (!foodItem.getStore().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("You don't have permission to update this item");
        }
        
        // Update fields
        foodItem.setItemName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setQuantity(request.getQuantity());
        foodItem.setOriginalPrice(request.getOriginalPrice());
        foodItem.setCurrentPrice(calculateDiscountedPrice(request.getOriginalPrice(), request.getExpiryDate()));
        foodItem.setExpiryDate(LocalDate.from(request.getExpiryDate()));
        
        // Save and return
        foodItem = foodItemRepository.save(foodItem);
        return convertToResponse(foodItem);
    }
    
    /**
     * Soft delete a food item (marks as deleted instead of removing from database)
     * This preserves order and payment history while hiding the item from listings.
     * 
     * @param id The ID of the food item to delete
     * @throws ResourceNotFoundException if the food item is not found
     */
    @Transactional
    public void deleteFoodItem(Long id) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));
        
        // Soft delete: just mark as deleted, don't actually remove from database
        foodItem.setDeleted(true);
        foodItemRepository.save(foodItem);
        
        // All order history and payment records are preserved! ✅
    }
    
    /**
     * Calculates the discounted price based on how soon the item expires.
     * Pricing Algorithm:
     * - More than 24 hours: 20% discount
     * - 12-24 hours: 40% discount  
     * - 6-12 hours: 60% discount
     * - Less than 6 hours: 80% discount
     * 
     * @param originalPrice The original price of the item
     * @param expiryDate The expiry date and time
     * @return The discounted price
     */
    private BigDecimal calculateDiscountedPrice(BigDecimal originalPrice, LocalDateTime expiryDate) {
        long hoursUntilExpiry = ChronoUnit.HOURS.between(LocalDateTime.now(), expiryDate);
        
        double discountPercentage;
        if (hoursUntilExpiry > 24) {
            discountPercentage = 0.20; // 20% off
        } else if (hoursUntilExpiry > 12) {
            discountPercentage = 0.40; // 40% off
        } else if (hoursUntilExpiry > 6) {
            discountPercentage = 0.60; // 60% off
        } else {
            discountPercentage = 0.80; // 80% off
        }
        
        BigDecimal discount = originalPrice.multiply(BigDecimal.valueOf(discountPercentage));
        return originalPrice.subtract(discount);
    }
    
    /**
     * Converts a FoodItem entity to a FoodItemResponse DTO.
     * This method maps database entity fields to API response fields.
     * 
     * @param foodItem The food item entity
     * @return FoodItemResponse DTO
     */
    private FoodItemResponse convertToResponse(FoodItem foodItem) {
        // Calculate discount percentage
        BigDecimal discount = foodItem.getOriginalPrice().subtract(foodItem.getCurrentPrice());
        int discountPercentage = discount.multiply(BigDecimal.valueOf(100))
                .divide(foodItem.getOriginalPrice(), 0, BigDecimal.ROUND_HALF_UP)
                .intValue();
        
        // Get store information if available
        Store store = storeRepository.findByUserId(foodItem.getStore().getId()).orElse(null);
        
        return FoodItemResponse.builder()
                .id(foodItem.getId())
                .name(foodItem.getItemName())
                .description(foodItem.getDescription())
                .imageUrl(foodItem.getImageUrl())
                .category(foodItem.getCategory())
                .quantity(foodItem.getQuantity())
                .originalPrice(foodItem.getOriginalPrice())
                .currentPrice(foodItem.getCurrentPrice())
                .discountPercentage(discountPercentage)
                .expiryDate(foodItem.getExpiryDate().atStartOfDay())
                .status(foodItem.getStatus().toString())
                .storeManagerId(foodItem.getStore().getId())
                .storeManagerName(foodItem.getStore().getFirstName() + " " + foodItem.getStore().getLastName())
                .storeName(store != null ? store.getStoreName() : foodItem.getStore().getFirstName() + "'s Store")
                .storeLatitude(store != null ? store.getLatitude() : null)
                .storeLongitude(store != null ? store.getLongitude() : null)
                .storeAddress(store != null ? store.getAddress() : null)
                .createdAt(foodItem.getCreatedAt())
                .isDonation(foodItem.getIsDonation())
                .build();
    }
    
    /**
     * Marks a food item as donation.
     * Only the store manager who owns the item can mark it as donation.
     * 
     * @param id The food item ID
     * @return FoodItemResponse containing the updated food item
     */
    @Transactional
    public FoodItemResponse markAsDonation(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User store = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));
        
        // Verify ownership
        if (!foodItem.getStore().getId().equals(store.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this item");
        }
        
        foodItem.setIsDonation(true);
        foodItem = foodItemRepository.save(foodItem);
        
        return convertToResponse(foodItem);
    }
    
    /**
     * Retrieves all food items marked as donations.
     * 
     * @return List of donation food items
     */
    public List<FoodItemResponse> getAllDonations() {
        return foodItemRepository.findByIsDonationAndDeletedAndStatus(true, false, FoodItemStatus.AVAILABLE)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}
