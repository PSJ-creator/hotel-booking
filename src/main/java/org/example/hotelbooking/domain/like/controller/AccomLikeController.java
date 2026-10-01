package org.example.hotelbooking.domain.like.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.like.service.AccomLikeService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/likes/accommodations")
@RequiredArgsConstructor
public class AccomLikeController {

    private final AccomLikeService accomLikeService;

    // 1. 찜 토글
    @PostMapping("/{contentId}")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable String contentId,
            @AuthenticationPrincipal String email
    ) {
        boolean liked = accomLikeService.toggleLike(email, contentId);
        return ResponseEntity.ok(Map.of(
                "liked", liked,
                "message", liked ? "위시리스트에 저장되었습니다." : "위시리스트에서 제외되었습니다."
        ));
    }

    // 2. 내 위시리스트 조회 (날짜 및 인원 조건 반영)
    @GetMapping("/my")
    public ResponseEntity<List<StayResponseDto>> getMyWishlist(
            @AuthenticationPrincipal String email,
            @RequestParam(value = "checkIn", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate checkIn,
            @RequestParam(value = "checkOut", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate checkOut,
            @RequestParam(value = "guests", required = false) Integer guests
    ) {
        return ResponseEntity.ok(accomLikeService.getMyWishlist(email, checkIn, checkOut, guests));
    }

    // 3. 특정 숙소 찜 여부 단건 확인
    @GetMapping("/{contentId}/status")
    public ResponseEntity<Boolean> getLikeStatus(
            @PathVariable String contentId,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(accomLikeService.isLiked(email, contentId));
    }
}