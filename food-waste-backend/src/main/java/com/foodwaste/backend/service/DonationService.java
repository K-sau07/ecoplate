package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.DonationClaimRequest;
import com.foodwaste.backend.dto.DonationClaimResponse;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.*;
import com.foodwaste.backend.repository.DonationClaimRepository;
import com.foodwaste.backend.repository.FoodItemRepository;
import com.foodwaste.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationClaimRepository donationClaimRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // NGO claims a donation
    @Transactional
    public DonationClaimResponse claimDonation(DonationClaimRequest request, String ngoEmail) {
        User ngo = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        if (ngo.getRole() != UserRole.NGO) {
            throw new IllegalArgumentException("Only NGOs can claim donations");
        }

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        if (!foodItem.getIsDonation()) {
            throw new IllegalArgumentException("This item is not marked for donation");
        }

        if (foodItem.getQuantity() < request.getQuantityClaimed()) {
            throw new IllegalArgumentException("Requested quantity exceeds available quantity");
        }

        DonationClaim claim = DonationClaim.builder()
                .foodItem(foodItem)
                .ngo(ngo)
                .quantityClaimed(request.getQuantityClaimed())
                .ngoMessage(request.getNgoMessage())
                .status(DonationClaimStatus.PENDING)
                .build();

        DonationClaim savedClaim = donationClaimRepository.save(claim);

        String message = String.format("Donation Claimed! %s requested %d x %s",
                ngo.getFirstName(), // Assuming NGO name is stored in firstName
                request.getQuantityClaimed(),
                foodItem.getItemName());

        notificationService.createNotification(
                foodItem.getStore(), // Notify Store Manager
                message,
                NotificationType.INFO,
                savedClaim.getId());
                
        return mapToResponse(savedClaim);
    }

    // Store manager accepts/rejects a claim
    @Transactional
    public DonationClaimResponse updateClaimStatus(Long claimId, DonationClaimStatus status,
            String storeResponse, String storeEmail) {
        DonationClaim claim = donationClaimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation claim not found"));

        User store = userRepository.findByEmail(storeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        // Verify the store owns this food item
        if (!claim.getFoodItem().getStore().getId().equals(store.getId())) {
            throw new IllegalArgumentException("You don't have permission to update this claim");
        }

        // Prevent changing status if already processed
        if (claim.getStatus() != DonationClaimStatus.PENDING) {
            throw new IllegalArgumentException("This claim has already been processed");
        }

        claim.setStatus(status);
        claim.setStoreResponse(storeResponse);

        // If accepted, reduce the food item quantity
        if (status == DonationClaimStatus.ACCEPTED) {
            FoodItem foodItem = claim.getFoodItem();
            int newQuantity = foodItem.getQuantity() - claim.getQuantityClaimed();

            if (newQuantity < 0) {
                throw new IllegalArgumentException("Not enough quantity available");
            }

            foodItem.setQuantity(newQuantity);

            if (newQuantity == 0) {
                foodItem.setStatus(FoodItemStatus.CLAIMED);
            }

            foodItemRepository.save(foodItem);
        }

        DonationClaim updatedClaim = donationClaimRepository.save(claim);
        return mapToResponse(updatedClaim);
    }

    // Get all claims for an NGO
    public List<DonationClaimResponse> getNgoClaims(String ngoEmail) {
        User ngo = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        return donationClaimRepository.findByNgo(ngo).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get all claims for a store manager
    public List<DonationClaimResponse> getStoreClaims(String storeEmail) {
        User store = userRepository.findByEmail(storeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        return donationClaimRepository.findByFoodItem_Store(store).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get pending claims for a store
    public List<DonationClaimResponse> getStorePendingClaims(String storeEmail) {
        User store = userRepository.findByEmail(storeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        return donationClaimRepository.findByFoodItem_StoreAndStatus(store, DonationClaimStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // NGO marks claim as collected
    public DonationClaimResponse markAsCollected(Long claimId, String ngoEmail) {
        DonationClaim claim = donationClaimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        User ngo = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        if (!claim.getNgo().getId().equals(ngo.getId())) {
            throw new RuntimeException("You can only update your own claims");
        }

        if (claim.getStatus() != DonationClaimStatus.ACCEPTED) {
            throw new RuntimeException("Can only mark accepted claims as collected");
        }

        claim.setStatus(DonationClaimStatus.COLLECTED);
        claim.setUpdatedAt(LocalDateTime.now());
        donationClaimRepository.save(claim);

        return mapToResponse(claim);
    }

    // Helper method to map DonationClaim to Response
    private DonationClaimResponse mapToResponse(DonationClaim claim) {
        return DonationClaimResponse.builder()
                .id(claim.getId())
                .foodItemId(claim.getFoodItem().getId())
                .foodItemName(claim.getFoodItem().getItemName())
                .storeName(claim.getFoodItem().getStore().getFirstName() + " " +
                        claim.getFoodItem().getStore().getLastName())
                .storeEmail(claim.getFoodItem().getStore().getEmail())
                .ngoName(claim.getNgo().getFirstName() + " " + claim.getNgo().getLastName())
                .ngoEmail(claim.getNgo().getEmail())
                .quantityClaimed(claim.getQuantityClaimed())
                .status(claim.getStatus())
                .ngoMessage(claim.getNgoMessage())
                .storeResponse(claim.getStoreResponse())
                .createdAt(claim.getCreatedAt())
                .updatedAt(claim.getUpdatedAt())
                .build();
    }
}
