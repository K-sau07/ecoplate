package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.StoreRequest;
import com.foodwaste.backend.dto.StoreResponse;
import com.foodwaste.backend.model.Store;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.model.UserRole;
import com.foodwaste.backend.repository.StoreRepository;
import com.foodwaste.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for StoreService
 * Tests store profile creation and retrieval
 */
@ExtendWith(MockitoExtension.class)
class StoreServiceTest {

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private StoreService storeService;

    private User storeManager;
    private Store store;

    @BeforeEach
    void setUp() {
        storeManager = User.builder()
                .id(1L)
                .email("store@example.com")
                .firstName("John")
                .lastName("Store")
                .role(UserRole.STORE_MANAGER)
                .build();

        store = Store.builder()
                .id(1L)
                .user(storeManager)
                .storeName("Fresh Market")
                .storeDescription("Best groceries in town")
                .latitude(42.3601)
                .longitude(-71.0589)
                .address("Boston, MA")
                .build();
    }

    @Test
    void testCreateStore_Success() {
        // Arrange
        StoreRequest request = StoreRequest.builder()
                .storeName("Fresh Market")
                .storeDescription("Best groceries")
                .latitude(42.3601)
                .longitude(-71.0589)
                .address("Boston, MA")
                .build();

        when(authentication.getName()).thenReturn("store@example.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        
        when(userRepository.findByEmail("store@example.com")).thenReturn(Optional.of(storeManager));
        when(storeRepository.findByUser(storeManager)).thenReturn(Optional.empty());
        when(storeRepository.save(any(Store.class))).thenReturn(store);

        // Act
        StoreResponse response = storeService.createOrUpdateStore(request);

        // Assert
        assertNotNull(response);
        assertEquals("Fresh Market", response.getStoreName());
        assertEquals(42.3601, response.getLatitude());
        
        verify(storeRepository, times(1)).save(any(Store.class));
    }

    @Test
    void testUpdateStore_Success() {
        // Arrange
        StoreRequest request = StoreRequest.builder()
                .storeName("Updated Market")
                .storeDescription("New description")
                .latitude(42.3601)
                .longitude(-71.0589)
                .address("Boston, MA")
                .build();

        when(authentication.getName()).thenReturn("store@example.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        
        when(userRepository.findByEmail("store@example.com")).thenReturn(Optional.of(storeManager));
        when(storeRepository.findByUser(storeManager)).thenReturn(Optional.of(store));
        when(storeRepository.save(any(Store.class))).thenReturn(store);

        // Act
        StoreResponse response = storeService.createOrUpdateStore(request);

        // Assert
        assertNotNull(response);
        verify(storeRepository, times(1)).save(any(Store.class));
    }
}
