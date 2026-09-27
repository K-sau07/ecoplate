package com.foodwaste.backend.service.factory;

import com.foodwaste.backend.dto.SignupRequest;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.model.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Factory Pattern (GoF Design Pattern)
 * Creates different types of users based on their role
 * This allows for role-specific initialization logic in the future
 */
@Component
public class UserFactory {
    
    private final PasswordEncoder passwordEncoder;
    
    public UserFactory(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Factory method to create users based on role
     * @param request SignupRequest containing user details
     * @return User entity with role-specific configuration
     */
    public User createUser(SignupRequest request) {
        User baseUser = buildBaseUser(request);
        
        // Apply role-specific configuration
        return switch (request.getRole()) {
            case STORE_MANAGER -> createStoreManager(baseUser);
            case NGO -> createNgoUser(baseUser);
            case CUSTOMER -> createCustomer(baseUser);
            case ADMIN -> createAdmin(baseUser);
        };
    }
    
    /**
     * Builds base user with common properties
     */
    private User buildBaseUser(SignupRequest request) {
        return User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .enabled(true)
                .build();
    }
    
    /**
     * Role-specific user creation methods
     * These can be extended with role-specific properties in the future
     */
    private User createStoreManager(User user) {
        // Store manager specific initialization
        // Can add store-specific properties here
        return user;
    }
    
    private User createNgoUser(User user) {
        // NGO specific initialization
        // Can add NGO-specific properties here
        return user;
    }
    
    private User createCustomer(User user) {
        // Customer specific initialization
        // Can add customer-specific properties here
        return user;
    }
    
    private User createAdmin(User user) {
        // Admin specific initialization
        // Can add admin-specific properties here
        return user;
    }
}