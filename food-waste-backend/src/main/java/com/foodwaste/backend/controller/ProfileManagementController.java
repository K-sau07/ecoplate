package com.foodwaste.backend.controller;


import jakarta.validation.Valid;

import com.foodwaste.backend.dto.ProfileRequest;
import com.foodwaste.backend.dto.ProfileResponse;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileManagementController {

    public ProfileManagementController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    private final UserRepository userRepository;


    @RequestMapping(value = "/update/{id}", method = RequestMethod.PUT)
    public ResponseEntity<ProfileResponse> updateProfile(@PathVariable("id") Long id, @Valid @RequestBody ProfileRequest request) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User targetUser = optionalUser.get();
        if (request.getFirstName() != null) {
            targetUser.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            targetUser.setLastName(request.getLastName());
        }
        if (request.getPassword() != null) {
            targetUser.setPassword(request.getPassword());
        }

        if (request.getRole() != null) {
            targetUser.setRole(request.getRole());
        }
        if (request.getEmail() != null) {
            targetUser.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            targetUser.setPhoneNumber(request.getPhoneNumber());
        }
        userRepository.save(targetUser);
        ProfileResponse response = ProfileResponse.builder()
                .email(targetUser.getEmail())
                .firstName(targetUser.getFirstName())
                .lastName(targetUser.getLastName())
                .phoneNumber(targetUser.getPhoneNumber())
                .role(targetUser.getRole())
                .message("User updated successfully")
                .build();

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ProfileResponse> deleteProfile( @PathVariable("id") Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        userRepository.delete(optionalUser.get());
        return ResponseEntity.noContent().build();
    }
}