package com.foodwaste.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreResponse {
    private Long id;
    private String storeName;
    private String storeDescription;
    private String storeImage;
    private Double latitude;
    private Double longitude;
    private String address;
    private Long userId;
    private String managerName;
    private String managerEmail;
    private LocalDateTime createdAt;
}
