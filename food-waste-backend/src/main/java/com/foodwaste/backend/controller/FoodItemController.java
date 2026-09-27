package com.foodwaste.backend.controller;

import com.foodwaste.backend.dto.FoodItemRequest;
import com.foodwaste.backend.dto.FoodItemResponse;
import com.foodwaste.backend.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-items")
@CrossOrigin(origins = "*")
public class FoodItemController {
    
    @Autowired
    private FoodItemService foodItemService;
    
    @PostMapping
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<FoodItemResponse> createFoodItem(@Valid @RequestBody FoodItemRequest request) {
        return ResponseEntity.ok(foodItemService.createFoodItem(request));
    }
    
    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getAllAvailableItems() {
        return ResponseEntity.ok(foodItemService.getAllAvailableItems());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<FoodItemResponse>> getItemsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(foodItemService.getItemsByCategory(category));
    }
    
    @GetMapping("/my-items")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<List<FoodItemResponse>> getMyFoodItems() {
        return ResponseEntity.ok(foodItemService.getMyFoodItems());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemResponse> getFoodItemById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodItemById(id));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<FoodItemResponse> updateFoodItem(
            @PathVariable Long id,
            @Valid @RequestBody FoodItemRequest request) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/mark-donation")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<FoodItemResponse> markAsDonation(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.markAsDonation(id));
    }
    
    @GetMapping("/donations")
    public ResponseEntity<List<FoodItemResponse>> getAllDonations() {
        return ResponseEntity.ok(foodItemService.getAllDonations());
    }
}