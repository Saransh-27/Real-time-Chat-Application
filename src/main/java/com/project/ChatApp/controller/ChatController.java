package com.project.ChatApp.controller;

import com.project.ChatApp.entity.Message;
import com.project.ChatApp.payload.MessageRequest;
import com.project.ChatApp.repository.RoomRepository;
import com.project.ChatApp.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;

@Controller
@EnableWebSocketMessageBroker
public class ChatController {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private ChatService chatService;

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ){
        return chatService.sendMessage(request);
    }



}
