package com.foodwaste.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreRequest {
    private String storeName;
    private String storeDescription;
    private String storeImage;
    private Double latitude;
    private Double longitude;
    private String address;
}
