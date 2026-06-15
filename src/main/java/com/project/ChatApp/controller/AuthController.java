package com.project.ChatApp.controller;

import com.project.ChatApp.entity.User;
import com.project.ChatApp.payload.LoginRequest;
import com.project.ChatApp.payload.LoginResponse;
import com.project.ChatApp.repository.UserRepository;
import com.project.ChatApp.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest dto){
        try{
            // Validate that at least one identifier is provided
            if ((dto.getUserName() == null || dto.getUserName().isBlank())){
                throw new IllegalArgumentException("username is required");
            }

            if (dto.getPassword() == null || dto.getPassword().isBlank()) {
                throw new IllegalArgumentException("Password is required");
            }

            // Try to find user by username first
            User user = null;

            if (!dto.getUserName().isBlank()) {
                user = userRepository.findByUserName(dto.getUserName().toLowerCase())
                        .orElse(null);
            }

            // If still not found, throw exception
            if (user == null) {
                throw new IllegalArgumentException("Invalid username or password");
            }

            // Authenticate using the username (for Spring Security)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), dto.getPassword()));

            String token = jwtUtil.generateToken(authentication.getName());

            // Return both token and user data
            log.info("User {} logged in successfully", user.getUserName());
            return ResponseEntity.ok(new LoginResponse(token, user));
        }catch (Exception e){
            log.error("Exception occurred while createAuthenticationToken ", e);
            throw e; // Let global exception handler handle it
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request){
        String userName = request.getUserName().toLowerCase();
        Optional<User> existingUser = userRepository.findByUserName(userName);
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        try{
            User user = new User();
            user.setUserName(userName);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
            log.info("new User with UserName : {} is created", user.getUserName());
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully !!! Now you can login");
        }catch (Exception e){
            log.error("Exception occurred while register ", e);
            throw e; // Let global exception handler handle it
        }
    }
}
