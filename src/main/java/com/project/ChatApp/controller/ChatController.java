package com.project.ChatApp.controller;

import com.project.ChatApp.entity.Message;
import com.project.ChatApp.payload.MessageRequest;
import com.project.ChatApp.repository.RoomRepository;
import com.project.ChatApp.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;

@Controller
@CrossOrigin()
@Slf4j
public class ChatController {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private ChatService chatService;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable("roomId") String roomId,
            @Payload MessageRequest request
    ){
        log.info("sendMessage: received message for roomId={} from sender={}", roomId, request.getSender());
        request.setRoomId(roomId); // Ensure the roomId from URL is used
        Message savedMessage = chatService.sendMessage(request);
        return savedMessage;
    }

    @PostMapping(path = "/api/v1/chat/send", consumes = {"multipart/form-data"})
    @ResponseBody
    public Message sendMessageWithFile(@RequestPart("roomId") String roomId,
                                       @RequestPart("sender") String sender,
                                       @RequestPart(value = "content", required = false) String content,
                                       @RequestPart(value = "file", required = false) MultipartFile file){
        log.info("sendMessageWithFile called roomId={} sender={} filePresent={}", roomId, sender, file != null && !file.isEmpty());
        MessageRequest req = new MessageRequest(sender, content, roomId, null);
        Message savedMessage = chatService.sendMessage(req, file);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
        return savedMessage;
    }


}
