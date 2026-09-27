package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.DonationClaim;
import com.foodwaste.backend.model.DonationClaimStatus;
import com.foodwaste.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationClaimRepository extends JpaRepository<DonationClaim, Long> {
    
    // Find all claims by NGO
    List<DonationClaim> findByNgo(User ngo);
    
    // Find all claims for items belonging to a specific store
    List<DonationClaim> findByFoodItem_Store(User store);
    
    // Find claims by status
    List<DonationClaim> findByStatus(DonationClaimStatus status);
    
    // Find pending claims for a specific store
    List<DonationClaim> findByFoodItem_StoreAndStatus(User store, DonationClaimStatus status);
}
