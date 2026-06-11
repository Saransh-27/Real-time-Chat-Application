package com.project.ChatApp.service;

import com.project.ChatApp.entity.Message;
import com.project.ChatApp.entity.Room;
import com.project.ChatApp.payload.MessageRequest;
import com.project.ChatApp.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ChatService {

    @Autowired
    private RoomRepository roomRepository;

    public Message sendMessage(MessageRequest request){
        Room room = roomRepository.findByRoomId(request.getRoomId());
        if (room == null) {
            throw new RuntimeException("Room does not exist !!!");
        }
        Message message = new Message();
        message.setSender(request.getSender());
        message.setContent(request.getContent());
        message.setTimestamp(LocalDateTime.now());
        room.getMessages().add(message);
        roomRepository.save(room);
        return message;
    }
}
