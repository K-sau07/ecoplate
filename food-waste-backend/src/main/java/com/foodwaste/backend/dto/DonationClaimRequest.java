package com.foodwaste.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationClaimRequest {
    private Long foodItemId;
    private Integer quantityClaimed;
    private String ngoMessage;
}
