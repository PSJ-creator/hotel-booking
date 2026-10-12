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