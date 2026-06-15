package com.project.ChatApp.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String id;
    private String sender;
    private String content;
    private LocalDateTime timestamp;
    // Optional file attachment (data URL or base64) and original filename
    private String senderProfilePhoto;
    private String attachmentFileName;
    private String attachmentData;
}
