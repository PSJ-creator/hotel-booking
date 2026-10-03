package org.example.hotelbooking.domain.accommodation.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationDto;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationResponse;
import org.example.hotelbooking.domain.accommodation.service.AccommodationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accommodations")
@RequiredArgsConstructor
public class AccommodationController {

    private final AccommodationService accommodationService;

    @Value("${kakao.map.key:}")
    private String kakaoMapKey;

    @Value("${openweather.api.key:${VITE_OPENWEATHER_API_KEY:}}")
    private String openWeatherApiKey;

    // 카카오 지도 JavaScript 키 조회 API
    @GetMapping("/map-key")
    public ResponseEntity<Map<String, String>> getKakaoMapKey() {
        return ResponseEntity.ok(Map.of("mapKey", kakaoMapKey));
    }

    // OpenWeatherMap API 키 조회 API
    @GetMapping("/weather-key")
    public ResponseEntity<Map<String, String>> getWeatherKey() {
        return ResponseEntity.ok(Map.of("apiKey", openWeatherApiKey));
    }

    // 기존에 만드신 지도 기반 숙소 조회 API (유지)
    @GetMapping
    public ResponseEntity<List<AccommodationResponse>> getMapAccommodations(
            @RequestParam String minX,
            @RequestParam String maxX,
            @RequestParam String minY,
            @RequestParam String maxY) {

        List<AccommodationResponse> response = accommodationService.getAccommodationsInMap(minX, maxX, minY, maxY);
        return ResponseEntity.ok(response);
    }

    // 💡 승인된 숙소 보유 여부 확인 API
    @GetMapping("/has-approved")
    public ResponseEntity<Boolean> checkApprovedAccommodation(@AuthenticationPrincipal String email) {
        if (email == null) {
            return ResponseEntity.ok(false);
        }
        boolean hasApproved = accommodationService.hasApprovedAccommodation(email);
        return ResponseEntity.ok(hasApproved);
    }

    // 💡 1. 숙소 신규 등록 API
    @PreAuthorize("hasRole('HOST')")
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody AccommodationDto.RegisterRequest request,
            @AuthenticationPrincipal String email
    ) {
        String contentId = accommodationService.register(email, request);
        return ResponseEntity.ok(contentId);
    }

    // 💡 2. 호스트 내 숙소 상세 목록 조회 API (DB 전체 컬럼 반환)
    @PreAuthorize("hasRole('HOST')")
    @GetMapping("/my")
    public ResponseEntity<List<AccommodationDto.HostDetailResponse>> getMyAccommodations(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(accommodationService.getMyAccommodations(email));
    }

    // 💡 3. [신규 추가] 호스트 내 숙소 정보 수정 API
    @PreAuthorize("hasRole('HOST')")
    @PutMapping("/{contentId}")
    public ResponseEntity<String> updateMyAccommodation(
            @PathVariable String contentId,
            @RequestBody AccommodationDto.UpdateRequest request,
            @AuthenticationPrincipal String email
    ) {
        accommodationService.updateMyAccommodation(email, contentId, request);
        return ResponseEntity.ok("숙소 정보가 성공적으로 수정되었습니다.");
    }

    // 💡 4. [신규 추가] 호스트 내 숙소 삭제 API (진행 중 예약 없을 때만 허용)
    @PreAuthorize("hasRole('HOST')")
    @DeleteMapping("/{contentId}")
    public ResponseEntity<?> deleteMyAccommodation(
            @PathVariable String contentId,
            @AuthenticationPrincipal String email
    ) {
        try {
            accommodationService.deleteMyAccommodation(email, contentId);
            return ResponseEntity.ok(Map.of("message", "숙소가 정상적으로 삭제되었습니다."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }


}