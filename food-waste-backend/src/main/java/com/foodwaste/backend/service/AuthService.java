package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.AuthResponse;
import com.foodwaste.backend.dto.LoginRequest;
import com.foodwaste.backend.dto.SignupRequest;
import com.foodwaste.backend.exception.ResourceAlreadyExistsException;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.repository.UserRepository;
import com.foodwaste.backend.security.JwtUtil;
import com.foodwaste.backend.service.factory.UserFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

/**
 * Authentication Service
 * Handles user registration and login operations.
 * Uses Factory Pattern for user creation.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final UserFactory userFactory;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    
    /**
     * User signup method
     * Uses Factory Pattern to create users with role-specific initialization.
     * 
     * @param request SignupRequest containing user details
     * @return AuthResponse with JWT token and user info
     * @throws ResourceAlreadyExistsException if email already exists
     */
    public AuthResponse signup(SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("User already exists with email: " + request.getEmail());
        }
        
        // Use Factory Pattern to create user based on role
        User user = userFactory.createUser(request);
        
        // Save user to database
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .userId(user.getId())
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .message("User registered successfully")
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtUtil.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .userId(user.getId())
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }
}