package com.project.ChatApp.controller;

import com.project.ChatApp.entity.Room;
import com.project.ChatApp.repository.RoomRepository;
import com.project.ChatApp.repository.UserRepository;
import com.project.ChatApp.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/apis/v1/rooms")
@CrossOrigin()
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RoomService roomService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody String roomId){
        if (roomRepository.findByRoomId(roomId) != null) {
            return ResponseEntity.badRequest().body("Room already exists");
        }
        Room savedroom = roomService.createRoom(roomId);
        log.info("createRoom succeeded roomId={}", savedroom.getRoomId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedroom);
    }

    @GetMapping("/join/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId){
        try {
            // Validate input
            if (roomId == null || roomId.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room ID cannot be empty");
            }
            String result = roomService.joinRoom(roomId);

            if ("Joined room successfully".equals(result)) {
                log.info("joinRoom: user joined room {}", roomId);
                return ResponseEntity.ok(result);
            }
            if ("Already joined this room".equals(result)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
            }
            if ("Room does not exist".equals(result)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }
            if ("User not found".equals(result)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        } catch (Exception e) {
            log.error("joinRoom exception for room {}: {}", roomId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error joining room: " + e.getMessage());
        }
    }

    @GetMapping("/leave/{roomId}")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomId){
        try {
            if (roomId == null || roomId.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room ID cannot be empty");
            }

            log.info("leaveRoom called roomId={}", roomId);
            String result = roomService.leaveRoom(roomId);

            if ("Left room successfully".equals(result)) {
                log.info("leaveRoom: user left room {}", roomId);
                return ResponseEntity.ok(result);
            }
            if ("Not a member of the room".equals(result)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
            if ("Room does not exist".equals(result)) {
                log.warn("leaveRoom: room not found {}", roomId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }
            if ("User not found".equals(result)) {
                log.warn("leaveRoom: user not found or unauthenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }

            log.error("leaveRoom unexpected result for room {}: {}", roomId, result);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        } catch (Exception e) {
            log.error("leaveRoom exception for room {}: {}", roomId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error leaving room: " + e.getMessage());
        }
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getMessage(@PathVariable String roomId) {
        return ResponseEntity.ok().body(roomService.getMessage(roomId));
    }

    @GetMapping("/getrooms")
    public ResponseEntity<?> getRooms(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userName = authentication.getName();
        var userOpt = userRepository.findByUserName(userName);
        if (userOpt.isEmpty()) {
            log.warn("getRooms user not found: {}", userName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        log.info("getRooms returning {} rooms for user={}", userOpt.get().getRooms().size(), userName);
        return ResponseEntity.ok(userOpt.get().getRooms());
    }

}
