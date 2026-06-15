package com.project.ChatApp.service;

import com.project.ChatApp.entity.Message;
import com.project.ChatApp.entity.Room;
import com.project.ChatApp.entity.User;
import com.project.ChatApp.payload.MessageRequest;
import com.project.ChatApp.repository.RoomRepository;
import com.project.ChatApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class ChatService {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private UserRepository userRepository;

    public Message sendMessage(MessageRequest request){
        return sendMessage(request, null);
    }

    public Message sendMessage(MessageRequest request, MultipartFile file){
        Room room = roomRepository.findByRoomId(request.getRoomId());
        if (room == null) {
            throw new RuntimeException("Room does not exist !!!");
        }
        Message message = new Message();
        message.setSender(request.getSender());
        message.setContent(request.getContent());
        message.setTimestamp(LocalDateTime.now());

        // Attach sender's profile photo
        User sender = userRepository.findByUserName(request.getSender()).orElse(null);
        if (sender != null && sender.getProfilePhoto() != null) {
            message.setSenderProfilePhoto(sender.getProfilePhoto());
        }

        if (file != null && !file.isEmpty()){
            try{
                byte[] fileContent = file.getBytes();
                String base64File = Base64.getEncoder().encodeToString(fileContent);
                String mimeType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
                String dataUrl = "data:" + mimeType + ";base64," + base64File;
                message.setAttachmentFileName(file.getOriginalFilename());
                message.setAttachmentData(dataUrl);
            }catch (IOException e){
                throw new RuntimeException("Failed to read attachment", e);
            }
        }

        room.getMessages().add(message);
        roomRepository.save(room);
        return message;
    }
}

