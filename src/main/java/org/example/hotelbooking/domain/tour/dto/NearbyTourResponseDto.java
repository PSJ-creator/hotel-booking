package org.example.hotelbooking.domain.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NearbyTourResponseDto {
    private String contentId;
    private String title;
    private String firstImage;
    private double distanceKm;
}