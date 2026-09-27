package com.foodwaste.backend.dto;

import jakarta.validation.constraints.Email;
import com.foodwaste.backend.model.UserRole;
import lombok.Data;

@Data
public class ProfileRequest {

    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private UserRole role;

}