package com.project.ChatApp.service;

import com.project.ChatApp.entity.Message;
import com.project.ChatApp.entity.Room;
import com.project.ChatApp.entity.User;
import com.project.ChatApp.repository.RoomRepository;
import com.project.ChatApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Service
@Slf4j
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private UserRepository userRepository;


    public Room createRoom(String roomId) {
        Room room = new Room();
        room.setRoomId(roomId);
        roomRepository.save(room);
        log.info("createRoom saved roomId={}", roomId);
        return room;
    }

    public String joinRoom(String roomId){
        // Check if room exists
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return "Room does not exist";
        }

        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userRepository.findByUserName(userName).orElse(null);

        if (user == null) {
            return "User not found";
        }

        // Check if user is already in the room
        if (user.getRooms().contains(room)) {
            return "Already joined this room";
        }

        // Add room to user's room list and save
        user.getRooms().add(room);
        userRepository.save(user);
        log.info("joinRoom: user {} added to room {}", userName, roomId);
        return "Joined room successfully";
    }

    public List<Message> getMessage(String roomId){
        Room room = roomRepository.findByRoomId(roomId);
        if ( room == null) {
            return List.of();
        }
        return room.getMessages();
    }

    public String leaveRoom(String roomId) {
        // Check if room exists
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            log.warn("leaveRoom: room not found {}", roomId);
            return "Room does not exist";
        }

        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userRepository.findByUserName(userName).orElse(null);

        if (user == null) {
            log.warn("leaveRoom: user not found {}", userName);
            return "User not found";
        }

        // Check if user is in the room
        boolean removed = user.getRooms().removeIf(r -> roomId.equals(r.getRoomId()));
        if (!removed) {
            return "Not a member of the room";
        }

        userRepository.save(user);
        log.info("leaveRoom: user {} removed from room {}", userName, roomId);
        return "Left room successfully";
    }
}
