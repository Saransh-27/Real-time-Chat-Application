package com.project.ChatApp.service;

import com.project.ChatApp.entity.Message;
import com.project.ChatApp.entity.Room;
import com.project.ChatApp.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public Room createRoom(String roomId) {
        Room room = new Room();
        room.setRoomId(roomId);
        roomRepository.save(room);
        return room;
    }

    public String joinRoom(String roomId){
        if (roomRepository.findByRoomId(roomId) == null) {
            return "Room does not exist";
        }
        return "Joined room successfully";
    }

    public String getMessage(String roomId){
        Room room = roomRepository.findByRoomId(roomId);
        if ( room == null) {
            return "Room does not exist";
        }
        List<Message> messages = room.getMessages();
        return messages.toString();
    }
}
