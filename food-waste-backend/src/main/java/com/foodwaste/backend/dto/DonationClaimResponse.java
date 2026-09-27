package com.foodwaste.backend.dto;

import com.foodwaste.backend.model.DonationClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationClaimResponse {
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private String storeName;
    private String storeEmail;
    private String ngoName;
    private String ngoEmail;
    private Integer quantityClaimed;
    private DonationClaimStatus status;
    private String ngoMessage;
    private String storeResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
