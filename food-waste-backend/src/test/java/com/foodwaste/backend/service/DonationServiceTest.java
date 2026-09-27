package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.DonationClaimRequest;
import com.foodwaste.backend.dto.DonationClaimResponse;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.*;
import com.foodwaste.backend.repository.DonationClaimRepository;
import com.foodwaste.backend.repository.FoodItemRepository;
import com.foodwaste.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DonationService
 * Tests NGO donation claim workflow and store manager approval process
 */
@ExtendWith(MockitoExtension.class)
class DonationServiceTest {

    @Mock
    private DonationClaimRepository donationClaimRepository;

    @Mock
    private FoodItemRepository foodItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock 
    private NotificationService notificationService;

    @InjectMocks
    private DonationService donationService;

    private User ngo;
    private User storeManager;
    private FoodItem donationItem;
    private DonationClaim claim;

    @BeforeEach
    void setUp() {
        // Create test NGO user
        ngo = User.builder()
                .id(1L)
                .email("testngo@example.com")
                .firstName("Test")
                .lastName("NGO")
                .role(UserRole.NGO)
                .build();

        // Create test Store Manager user
        storeManager = User.builder()
                .id(2L)
                .email("store@example.com")
                .firstName("Store")
                .lastName("Manager")
                .role(UserRole.STORE_MANAGER)
                .build();

        // Create test donation food item
        donationItem = FoodItem.builder()
                .id(1L)
                .itemName("Test Sandwich")
                .quantity(10)
                .originalPrice(BigDecimal.valueOf(5.00))
                .currentPrice(BigDecimal.valueOf(4.00))
                .expiryDate(LocalDate.now().plusDays(2))
                .status(FoodItemStatus.AVAILABLE)
                .isDonation(true)
                .store(storeManager)
                .build();

        // Create test claim
        claim = DonationClaim.builder()
                .id(1L)
                .foodItem(donationItem)
                .ngo(ngo)
                .quantityClaimed(5)
                .ngoMessage("Need this for our community")
                .status(DonationClaimStatus.PENDING)
                .build();
    }

    @Test
    void testClaimDonation_Success() {
        // Arrange
        DonationClaimRequest request = DonationClaimRequest.builder()
                .foodItemId(1L)
                .quantityClaimed(5)
                .ngoMessage("Need this for our community")
                .build();

        when(userRepository.findByEmail("testngo@example.com")).thenReturn(Optional.of(ngo));
        when(foodItemRepository.findById(1L)).thenReturn(Optional.of(donationItem));
        when(donationClaimRepository.save(any(DonationClaim.class))).thenReturn(claim);

        // Act
        DonationClaimResponse response = donationService.claimDonation(request, "testngo@example.com");

        // Assert
        assertNotNull(response);
        assertEquals("Test Sandwich", response.getFoodItemName());
        assertEquals(5, response.getQuantityClaimed());
        assertEquals(DonationClaimStatus.PENDING, response.getStatus());

        verify(donationClaimRepository, times(1)).save(any(DonationClaim.class));

        // Verify notification was sent
        verify(notificationService, times(1)).createNotification(
                any(User.class), anyString(), eq(NotificationType.INFO), anyLong());
    }

    @Test
    void testClaimDonation_UserNotFound() {
        // Arrange
        DonationClaimRequest request = DonationClaimRequest.builder()
                .foodItemId(1L)
                .quantityClaimed(5)
                .build();

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            donationService.claimDonation(request, "nonexistent@example.com");
        });
    }

    @Test
    void testClaimDonation_NotNGO() {
        // Arrange
        DonationClaimRequest request = DonationClaimRequest.builder()
                .foodItemId(1L)
                .quantityClaimed(5)
                .build();

        User customer = User.builder()
                .email("customer@example.com")
                .role(UserRole.CUSTOMER)
                .build();

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            donationService.claimDonation(request, "customer@example.com");
        });
    }

    @Test
    void testClaimDonation_ItemNotDonation() {
        // Arrange
        donationItem.setIsDonation(false);

        DonationClaimRequest request = DonationClaimRequest.builder()
                .foodItemId(1L)
                .quantityClaimed(5)
                .build();

        when(userRepository.findByEmail("testngo@example.com")).thenReturn(Optional.of(ngo));
        when(foodItemRepository.findById(1L)).thenReturn(Optional.of(donationItem));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            donationService.claimDonation(request, "testngo@example.com");
        });
    }

    @Test
    void testClaimDonation_InsufficientQuantity() {
        // Arrange
        DonationClaimRequest request = DonationClaimRequest.builder()
                .foodItemId(1L)
                .quantityClaimed(20) // More than available (10)
                .build();

        when(userRepository.findByEmail("testngo@example.com")).thenReturn(Optional.of(ngo));
        when(foodItemRepository.findById(1L)).thenReturn(Optional.of(donationItem));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            donationService.claimDonation(request, "testngo@example.com");
        });
    }

    // ... existing tests for accept/reject remain the same (Mock will be ignored if
    // not used) ...

    @Test
    void testAcceptClaim_ReducesQuantity() {
        // Arrange
        when(donationClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(userRepository.findByEmail("store@example.com")).thenReturn(Optional.of(storeManager));
        when(donationClaimRepository.save(any(DonationClaim.class))).thenReturn(claim);
        when(foodItemRepository.save(any(FoodItem.class))).thenReturn(donationItem);

        // Act
        DonationClaimResponse response = donationService.updateClaimStatus(
                1L, DonationClaimStatus.ACCEPTED, "Approved!", "store@example.com");

        // Assert
        assertEquals(DonationClaimStatus.ACCEPTED, response.getStatus());
        verify(foodItemRepository, times(1)).save(any(FoodItem.class));
        assertEquals(5, donationItem.getQuantity()); // Should reduce from 10 to 5
    }

    @Test
    void testAcceptClaim_SetsStatusToClaimed_WhenQuantityZero() {
        // Arrange
        donationItem.setQuantity(5);
        claim.setQuantityClaimed(5);

        when(donationClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(userRepository.findByEmail("store@example.com")).thenReturn(Optional.of(storeManager));
        when(donationClaimRepository.save(any(DonationClaim.class))).thenReturn(claim);
        when(foodItemRepository.save(any(FoodItem.class))).thenReturn(donationItem);

        // Act
        donationService.updateClaimStatus(
                1L, DonationClaimStatus.ACCEPTED, "Approved!", "store@example.com");

        // Assert
        assertEquals(0, donationItem.getQuantity());
        assertEquals(FoodItemStatus.CLAIMED, donationItem.getStatus());
    }

    @Test
    void testRejectClaim_DoesNotReduceQuantity() {
        // Arrange
        when(donationClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(userRepository.findByEmail("store@example.com")).thenReturn(Optional.of(storeManager));
        when(donationClaimRepository.save(any(DonationClaim.class))).thenReturn(claim);

        // Act
        donationService.updateClaimStatus(
                1L, DonationClaimStatus.REJECTED, "Out of stock", "store@example.com");

        // Assert
        assertEquals(10, donationItem.getQuantity()); // Quantity unchanged
        verify(foodItemRepository, never()).save(any(FoodItem.class));
    }

    @Test
    void testUpdateClaimStatus_NotStoreOwner_ThrowsException() {
        // Arrange
        User differentStore = User.builder()
                .id(99L)
                .email("other@example.com")
                .role(UserRole.STORE_MANAGER)
                .build();

        when(donationClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(differentStore));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            donationService.updateClaimStatus(
                    1L, DonationClaimStatus.ACCEPTED, "Test", "other@example.com");
        });
    }

    @Test
    void testUpdateClaimStatus_AlreadyProcessed_ThrowsException() {
        // Arrange
        claim.setStatus(DonationClaimStatus.ACCEPTED);

        when(donationClaimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(userRepository.findByEmail("store@example.com")).thenReturn(Optional.of(storeManager));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            donationService.updateClaimStatus(
                    1L, DonationClaimStatus.ACCEPTED, "Test", "store@example.com");
        });
    }
}