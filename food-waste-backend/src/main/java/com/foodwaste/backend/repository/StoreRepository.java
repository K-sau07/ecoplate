package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.Store;
import com.foodwaste.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByUser(User user);
    Optional<Store> findByUserId(Long userId);
}
