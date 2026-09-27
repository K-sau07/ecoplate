package com.foodwaste.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "donation_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationClaim {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private User ngo;  // The NGO claiming the donation
    
    @Column(nullable = false)
    private Integer quantityClaimed;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationClaimStatus status; // PENDING, ACCEPTED, REJECTED
    
    @Column(columnDefinition = "TEXT")
    private String ngoMessage;  // Message from NGO when claiming
    
    @Column(columnDefinition = "TEXT")
    private String storeResponse;  // Response from store manager
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
