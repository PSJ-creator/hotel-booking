package org.example.hotelbooking.domain.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NearbyTourResponseDto {
    private String contentId;
    private String title;
    private String firstImage;
    // 숙소와 관광지간의 거리 반환
    private double distanceKm;
}