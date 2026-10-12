package org.example.hotelbooking.domain.tour.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.tour.dto.NearbyTourResponseDto;
import org.example.hotelbooking.domain.tour.dto.TourDto;
import org.example.hotelbooking.domain.tour.service.TourSearchService;
import org.example.hotelbooking.domain.tour.service.TourService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;
    private final TourSearchService tourSearchService;

    
    @GetMapping
    public ResponseEntity<List<TourDto.SummaryResponse>> getTours() {
        return ResponseEntity.ok(tourService.getAllTours());
    }

    
    @GetMapping("/nearby")
    public ResponseEntity<List<NearbyTourResponseDto>> getNearbyTours(
            @RequestParam("accomId") String accomContentId) {
        List<NearbyTourResponseDto> nearbyTours = tourSearchService.getNearbyTours(accomContentId);
        return ResponseEntity.ok(nearbyTours);
    }

    
    @GetMapping("/likes/my")
    public ResponseEntity<List<TourDto.SummaryResponse>> getMyTourWishlist(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(tourService.getMyLikedTours(email));
    }

    
    @GetMapping("/likes/{contentId}/status")
    public ResponseEntity<Boolean> getTourLikeStatus(
            @PathVariable String contentId,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(tourService.isLiked(email, contentId));
    }

    
    @PostMapping("/likes/{contentId}")
    public ResponseEntity<Map<String, Object>> toggleTourLike(
            @PathVariable String contentId,
            @AuthenticationPrincipal String email
    ) {
        boolean liked = tourService.toggleTourLike(email, contentId);
        return ResponseEntity.ok(Map.of(
                "liked", liked,
                "message", liked ? "관광지 위시리스트에 저장되었습니다." : "관광지 위시리스트에서 제외되었습니다."
        ));
    }

    
    @GetMapping("/{contentId}")
    public ResponseEntity<TourDto.DetailResponse> getTourDetail(@PathVariable String contentId) {
        return ResponseEntity.ok(tourService.getTourDetail(contentId));
    }
}