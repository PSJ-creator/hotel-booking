package org.example.hotelbooking.domain.room.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AvailableRoomResponse {
    private Long roomId;
    private String roomName;      // 예: "디럭스 오션뷰"
    private Integer price;        // 예: 150000
    private Integer availableCount; // 남은 방 개수

    // 💡 Entity -> DTO 변환 메서드
    public static AvailableRoomResponse from(org.example.hotelbooking.domain.room.entity.RoomInventory inventory) {
        return AvailableRoomResponse.builder()
                .roomId(inventory.getRoom().getRoomId()) // ⚠️️ Room 엔티티의 ID 필드명에 맞게 수정
                .roomName(inventory.getRoom().getRoomTitle()) // ⚠️ Room 엔티티의 방이름 필드명에 맞게 수정
                .price(inventory.getRoom().getPricePerNight()) // ⚠️ Room 엔티티의 가격 필드명에 맞게 수정
                .availableCount(inventory.getAvailableCount())
                .build();
    }
}