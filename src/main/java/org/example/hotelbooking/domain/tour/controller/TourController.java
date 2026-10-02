package org.example.hotelbooking.domain.tour.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.tour.dto.TourDto;
import org.example.hotelbooking.domain.tour.service.TourService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    // 1. 전체 관광지 목록 조회 (관광 지도용)
    @GetMapping("/tours")
    public ResponseEntity<List<TourDto.SummaryResponse>> getTours() {
        return ResponseEntity.ok(tourService.getAllTours());
    }

    // 2. 관광지 상세 조회
    @GetMapping("/tours/{contentId}")
    public ResponseEntity<TourDto.DetailResponse> getTourDetail(@PathVariable String contentId) {
        return ResponseEntity.ok(tourService.getTourDetail(contentId));
    }

    // 3. 관광지 찜 토글
    @PostMapping("/likes/tours/{contentId}")
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

    // 4. 특정 관광지 찜 상태 단건 확인
    @GetMapping("/likes/tours/{contentId}/status")
    public ResponseEntity<Boolean> getTourLikeStatus(
            @PathVariable String contentId,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(tourService.isLiked(email, contentId));
    }

    // 5. 내가 찜한 관광지 목록 조회
    @GetMapping("/likes/tours/my")
    public ResponseEntity<List<TourDto.SummaryResponse>> getMyTourWishlist(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(tourService.getMyLikedTours(email));
    }
}