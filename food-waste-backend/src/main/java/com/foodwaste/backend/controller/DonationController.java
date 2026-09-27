package com.foodwaste.backend.controller;

import com.foodwaste.backend.dto.DonationClaimRequest;
import com.foodwaste.backend.dto.DonationClaimResponse;
import com.foodwaste.backend.model.DonationClaimStatus;
import com.foodwaste.backend.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {
    
    private final DonationService donationService;
    
    // NGO claims a donation
    @PostMapping("/claim")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<DonationClaimResponse> claimDonation(
            @RequestBody DonationClaimRequest request,
            Authentication authentication) {
        String ngoEmail = authentication.getName();
        DonationClaimResponse response = donationService.claimDonation(request, ngoEmail);
        return ResponseEntity.ok(response);
    }
    
    // Store manager updates claim status (accept/reject)
    @PutMapping("/claims/{claimId}/status")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<DonationClaimResponse> updateClaimStatus(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String storeEmail = authentication.getName();
        DonationClaimStatus status = DonationClaimStatus.valueOf(request.get("status"));
        String storeResponse = request.get("storeResponse");
        
        DonationClaimResponse response = donationService.updateClaimStatus(
                claimId, status, storeResponse, storeEmail);
        return ResponseEntity.ok(response);
    }
    
    // NGO gets their claims
    @GetMapping("/ngo/claims")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<List<DonationClaimResponse>> getNgoClaims(Authentication authentication) {
        String ngoEmail = authentication.getName();
        List<DonationClaimResponse> claims = donationService.getNgoClaims(ngoEmail);
        return ResponseEntity.ok(claims);
    }
    
    // Store manager gets all claims for their items
    @GetMapping("/store/claims")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<List<DonationClaimResponse>> getStoreClaims(Authentication authentication) {
        String storeEmail = authentication.getName();
        List<DonationClaimResponse> claims = donationService.getStoreClaims(storeEmail);
        return ResponseEntity.ok(claims);
    }
    
    // Store manager gets pending claims
    @GetMapping("/store/claims/pending")
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public ResponseEntity<List<DonationClaimResponse>> getStorePendingClaims(Authentication authentication) {
        String storeEmail = authentication.getName();
        List<DonationClaimResponse> claims = donationService.getStorePendingClaims(storeEmail);
        return ResponseEntity.ok(claims);
    }
    
    // NGO marks claim as collected
    @PutMapping("/claims/{claimId}/collect")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<DonationClaimResponse> markAsCollected(
            @PathVariable Long claimId,
            Authentication authentication) {
        String ngoEmail = authentication.getName();
        DonationClaimResponse response = donationService.markAsCollected(claimId, ngoEmail);
        return ResponseEntity.ok(response);
    }
}
