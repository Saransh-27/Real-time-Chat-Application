package com.project.ChatApp.controller;

import com.project.ChatApp.entity.Room;
import com.project.ChatApp.repository.RoomRepository;
import com.project.ChatApp.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/apis/v1/rooms")
@CrossOrigin()
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RoomService roomService;

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody String roomId){
        if (roomRepository.findByRoomId(roomId) != null) {
            return ResponseEntity.badRequest().body("Room already exists");
        }
        Room savedroom = roomService.createRoom(roomId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedroom);
    }

    @GetMapping("/join/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId){

        String joined = roomService.joinRoom(roomId);
        return ResponseEntity.ok(joined);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<String> getMessage(@PathVariable String roomId) {
        String messages = roomService.getMessage(roomId);
        return ResponseEntity.ok().body(messages);
    }
}
