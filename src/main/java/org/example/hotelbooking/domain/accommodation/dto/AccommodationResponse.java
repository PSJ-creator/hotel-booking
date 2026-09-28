package org.example.hotelbooking.domain.accommodation.dto;

import lombok.Builder;
import lombok.Getter;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;

@Getter
@Builder
public class AccommodationResponse {
    private String contentId;
    private String title;
    private String mapX;
    private String mapY;
    private String firstImage;
    private String lodgingType;
    private String roomType;

    // Entity를 DTO로 변환하는 정적 팩토리 메서드
    public static AccommodationResponse from(Accommodation entity) {
        return AccommodationResponse.builder()
                .contentId(entity.getContentId())
                .title(entity.getTitle())
                .mapX(entity.getMapX())
                .mapY(entity.getMapY())
                .firstImage(entity.getFirstImage())
                .lodgingType(entity.getLodgingType())
                .roomType(entity.getRoomType())
                .build();
    }
}