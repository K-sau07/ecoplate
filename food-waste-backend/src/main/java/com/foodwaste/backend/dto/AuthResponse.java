package com.foodwaste.backend.dto;

import com.foodwaste.backend.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String message;
}