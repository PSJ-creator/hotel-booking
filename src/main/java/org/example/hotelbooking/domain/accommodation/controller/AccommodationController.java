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

    
    @GetMapping("/map-key")
    public ResponseEntity<Map<String, String>> getKakaoMapKey() {
        return ResponseEntity.ok(Map.of("mapKey", kakaoMapKey));
    }

    
    @GetMapping("/weather-key")
    public ResponseEntity<Map<String, String>> getWeatherKey() {
        return ResponseEntity.ok(Map.of("apiKey", openWeatherApiKey));
    }

    
    @GetMapping
    public ResponseEntity<List<AccommodationResponse>> getMapAccommodations(
            @RequestParam String minX,
            @RequestParam String maxX,
            @RequestParam String minY,
            @RequestParam String maxY) {

        List<AccommodationResponse> response = accommodationService.getAccommodationsInMap(minX, maxX, minY, maxY);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/has-approved")
    public ResponseEntity<Boolean> checkApprovedAccommodation(@AuthenticationPrincipal String email) {
        if (email == null) {
            return ResponseEntity.ok(false);
        }
        boolean hasApproved = accommodationService.hasApprovedAccommodation(email);
        return ResponseEntity.ok(hasApproved);
    }

    
    @PreAuthorize("hasRole('HOST')")
    @PostMapping({"", "/register"})
    public ResponseEntity<?> register(
            @RequestBody AccommodationDto.RegisterRequest request,
            @AuthenticationPrincipal String email
    ) {
        if (email == null || "anonymousUser".equals(email)) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요."));
        }
        try {
            String contentId = accommodationService.register(email, request);
            return ResponseEntity.ok(contentId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "숙소 등록 실패: " + e.getMessage()));
        }
    }

    
    @PreAuthorize("hasRole('HOST')")
    @GetMapping("/my")
    public ResponseEntity<List<AccommodationDto.HostDetailResponse>> getMyAccommodations(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(accommodationService.getMyAccommodations(email));
    }

    
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