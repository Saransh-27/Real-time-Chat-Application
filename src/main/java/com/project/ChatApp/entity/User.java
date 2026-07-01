package com.project.ChatApp.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    private String userName;
    private String password;

    @Indexed(unique = true, sparse = true)
    private String email;

    // OAuth2 fields
    private String provider;    // "local", "google", "github"
    private String providerId;  // The ID from the OAuth2 provider
    private String avatarUrl;   // Profile picture URL from OAuth2 provider

    @DBRef
    private List<Room> rooms = new ArrayList<>();
    private String profilePhoto;
}
