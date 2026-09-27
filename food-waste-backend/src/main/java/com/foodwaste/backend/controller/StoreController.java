package com.foodwaste.backend.controller;

import com.foodwaste.backend.dto.StoreRequest;
import com.foodwaste.backend.dto.StoreResponse;
import com.foodwaste.backend.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {
    
    private final StoreService storeService;
    
    @PostMapping("/profile")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<StoreResponse> createOrUpdateStore(@RequestBody StoreRequest request) {
        StoreResponse response = storeService.createOrUpdateStore(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-store")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<StoreResponse> getMyStore() {
        StoreResponse response = storeService.getMyStore();
        return ResponseEntity.ok(response);
    }
}
