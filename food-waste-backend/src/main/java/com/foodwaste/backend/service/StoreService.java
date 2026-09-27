package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.StoreRequest;
import com.foodwaste.backend.dto.StoreResponse;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.Store;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.repository.StoreRepository;
import com.foodwaste.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreService {
    
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public StoreResponse createOrUpdateStore(StoreRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if store already exists for this user
        Store store = storeRepository.findByUser(user).orElse(null);
        
        if (store == null) {
            // Create new store
            store = Store.builder()
                    .user(user)
                    .storeName(request.getStoreName())
                    .storeDescription(request.getStoreDescription())
                    .storeImage(request.getStoreImage())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .address(request.getAddress())
                    .build();
        } else {
            // Update existing store
            store.setStoreName(request.getStoreName());
            store.setStoreDescription(request.getStoreDescription());
            store.setStoreImage(request.getStoreImage());
            store.setLatitude(request.getLatitude());
            store.setLongitude(request.getLongitude());
            store.setAddress(request.getAddress());
        }
        
        store = storeRepository.save(store);
        return mapToResponse(store);
    }
    
    public StoreResponse getMyStore() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Store store = storeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Store profile not found"));
        
        return mapToResponse(store);
    }
    
    private StoreResponse mapToResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .storeName(store.getStoreName())
                .storeDescription(store.getStoreDescription())
                .storeImage(store.getStoreImage())
                .latitude(store.getLatitude())
                .longitude(store.getLongitude())
                .address(store.getAddress())
                .userId(store.getUser().getId())
                .managerName(store.getUser().getFirstName() + " " + store.getUser().getLastName())
                .managerEmail(store.getUser().getEmail())
                .createdAt(store.getCreatedAt())
                .build();
    }
}
