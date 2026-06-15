package com.project.ChatApp.controller;

import com.project.ChatApp.entity.User;
import com.project.ChatApp.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userName = authentication.getName();
        var userOpt = userRepository.findByUserName(userName);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        // Don't return password
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile-photo")
    public ResponseEntity<?> updateProfilePhoto(@RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userName = authentication.getName();
        var userOpt = userRepository.findByUserName(userName);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String profilePhoto = body.get("profilePhoto");
        if (profilePhoto == null || profilePhoto.isBlank()) {
            return ResponseEntity.badRequest().body("Profile photo data is required");
        }

        User user = userOpt.get();
        user.setProfilePhoto(profilePhoto);
        userRepository.save(user);

        log.info("Profile photo updated for user: {}", userName);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/profile-photo/upload")
    public ResponseEntity<?> uploadProfilePhoto(@RequestPart("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userName = authentication.getName();
        var userOpt = userRepository.findByUserName(userName);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        try {
            byte[] fileContent = file.getBytes();
            String base64File = Base64.getEncoder().encodeToString(fileContent);
            String mimeType = file.getContentType() == null ? "image/png" : file.getContentType();
            String dataUrl = "data:" + mimeType + ";base64," + base64File;

            User user = userOpt.get();
            user.setProfilePhoto(dataUrl);
            userRepository.save(user);

            log.info("Profile photo uploaded for user: {}", userName);
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (IOException e) {
            log.error("Failed to process file upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload profile photo");
        }
    }

    @PutMapping("/update-username")
    public ResponseEntity<?> updateUsername(@RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String currentUserName = authentication.getName();
        var userOpt = userRepository.findByUserName(currentUserName);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String newUserName = body.get("newUserName");
        if (newUserName == null || newUserName.isBlank()) {
            return ResponseEntity.badRequest().body("New username is required");
        }
        newUserName = newUserName.toLowerCase().trim();

        // Check for duplicate
        if (userRepository.findByUserName(newUserName).isPresent()) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        User user = userOpt.get();
        user.setUserName(newUserName);
        userRepository.save(user);

        log.info("Username updated from {} to {}", currentUserName, newUserName);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userName = authentication.getName();
        var userOpt = userRepository.findByUserName(userName);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || currentPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Current password is required");
        }
        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 4) {
            return ResponseEntity.badRequest().body("New password must be at least 4 characters");
        }

        User user = userOpt.get();

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password updated for user: {}", userName);
        return ResponseEntity.ok("Password updated successfully");
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userName = authentication.getName();
        var userOpt = userRepository.findByUserName(userName);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        userRepository.delete(userOpt.get());
        log.info("Account deleted for user: {}", userName);
        return ResponseEntity.ok("Account deleted successfully");
    }
}
