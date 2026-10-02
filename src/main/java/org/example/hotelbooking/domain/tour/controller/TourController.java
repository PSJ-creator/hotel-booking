package org.example.hotelbooking.domain.tour.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.tour.dto.NearbyTourResponseDto;
import org.example.hotelbooking.domain.tour.service.TourSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourSearchService tourSearchService;

    // 특정 숙소 주변의 관광지 목록 조회 API
    @GetMapping("/nearby")
    public ResponseEntity<List<NearbyTourResponseDto>> getNearbyTours(
            @RequestParam("accomId") String accomContentId) {

        List<NearbyTourResponseDto> nearbyTours = tourSearchService.getNearbyTours(accomContentId);
        return ResponseEntity.ok(nearbyTours);
    }
}