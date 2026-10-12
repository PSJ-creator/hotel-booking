package org.example.hotelbooking.domain.room.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AvailableRoomResponse {
    private Long roomId;
    private String roomName;      
    private Integer price;        
    private Integer availableCount; 

    
    public static AvailableRoomResponse from(org.example.hotelbooking.domain.room.entity.RoomInventory inventory) {
        return AvailableRoomResponse.builder()
                .roomId(inventory.getRoom().getRoomId()) 
                .roomName(inventory.getRoom().getRoomTitle()) 
                .price(inventory.getRoom().getPricePerNight()) 
                .availableCount(inventory.getAvailableCount())
                .build();
    }
}