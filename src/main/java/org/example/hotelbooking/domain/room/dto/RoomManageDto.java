package org.example.hotelbooking.domain.room.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.hotelbooking.domain.room.entity.Room;

import java.util.List;

public class RoomManageDto {

    @Getter
    @NoArgsConstructor
    public static class SaveRequest {
        private String roomTitle;
        private String roomSize;
        private String roomBaseCount;
        private String roomMaxCount;
        private Integer pricePerNight;
        private Integer initialStock; // 신규 등록 시 일일 기본 재고 수 (기본 5실)
        private List<String> imageUrls;
    }

    @Getter
    @Builder
    public static class Response {
        private Long roomId;
        private String roomTitle;
        private String roomSize;
        private String roomBaseCount;
        private String roomMaxCount;
        private Integer pricePerNight;
        private List<String> imageUrls;

        public static Response of(Room room, List<String> imageUrls) {
            return Response.builder()
                    .roomId(room.getRoomId())
                    .roomTitle(room.getRoomTitle())
                    .roomSize(room.getRoomSize())
                    .roomBaseCount(room.getRoomBaseCount())
                    .roomMaxCount(room.getRoomMaxCount())
                    .pricePerNight(room.getPricePerNight())
                    .imageUrls(imageUrls)
                    .build();
        }
    }
}