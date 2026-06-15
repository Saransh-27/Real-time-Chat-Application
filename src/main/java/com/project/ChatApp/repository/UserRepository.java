package com.project.ChatApp.repository;

import com.project.ChatApp.entity.Room;
import com.project.ChatApp.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUserName(String userName);
    Room findRoomByUserName(String userName);
}
