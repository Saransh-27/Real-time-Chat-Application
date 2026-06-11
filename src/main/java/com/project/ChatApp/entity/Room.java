package com.project.ChatApp.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Room {
    @Id
    private String id;
    private String roomId;
    private List<Message> messages= new ArrayList<>();
}
