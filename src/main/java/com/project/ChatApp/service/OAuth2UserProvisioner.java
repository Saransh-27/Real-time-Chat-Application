package com.project.ChatApp.service;

import com.project.ChatApp.entity.User;
import com.project.ChatApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2UserProvisioner {

    private final UserRepository userRepository;

    public User saveOrUpdateUser(String registrationId, Map<String, Object> attributes) {
        String providerId;
        String email;
        String name;
        String avatarUrl;

        if ("google".equals(registrationId)) {
            providerId = (String) attributes.get("sub");
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            avatarUrl = (String) attributes.get("picture");
        } else if ("github".equals(registrationId)) {
            providerId = String.valueOf(attributes.get("id"));
            email = (String) attributes.get("email");
            name = (String) attributes.get("login"); // GitHub login username
            avatarUrl = (String) attributes.get("avatar_url");
        } else {
            throw new IllegalArgumentException("Unsupported OAuth2 provider: " + registrationId);
        }

        // Try to find existing user by provider + providerId first, then by email
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(registrationId, providerId);

        if (existingUser.isEmpty() && email != null) {
            existingUser = userRepository.findByEmail(email);
        }

        User user;
        if (existingUser.isPresent()) {
            // Update existing user with latest info from provider
            user = existingUser.get();
            String oldAvatarUrl = user.getAvatarUrl();
            user.setAvatarUrl(avatarUrl);
            if (user.getProvider() == null) {
                // User existed from local registration, link the OAuth2 provider
                user.setProvider(registrationId);
                user.setProviderId(providerId);
            }
            // Synchronize profilePhoto with avatarUrl if it was empty, or matches the old provider avatar
            if (user.getProfilePhoto() == null || user.getProfilePhoto().isBlank() || 
                (oldAvatarUrl != null && user.getProfilePhoto().equals(oldAvatarUrl))) {
                user.setProfilePhoto(avatarUrl);
            }
            log.info("Existing OAuth2 user logged in: {}", user.getUserName());
        } else {
            // Create new user
            user = new User();
            user.setProvider(registrationId);
            user.setProviderId(providerId);
            user.setEmail(email);
            user.setAvatarUrl(avatarUrl);
            user.setProfilePhoto(avatarUrl);

            // Generate a unique username
            String baseUsername = (name != null ? name : email != null ? email.split("@")[0] : "user")
                    .toLowerCase().replaceAll("[^a-z0-9]", "");
            String username = baseUsername;
            int counter = 1;
            while (userRepository.findByUserName(username).isPresent()) {
                username = baseUsername + counter++;
            }
            user.setUserName(username);
            log.info("New OAuth2 user created: {} via {}", username, registrationId);
        }

        return userRepository.save(user);
    }
}
