package org.example.hotelbooking.domain.accommodation.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationDto;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationResponse;
import org.example.hotelbooking.domain.accommodation.service.AccommodationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accommodations")
@RequiredArgsConstructor
public class AccommodationController {

    private final AccommodationService accommodationService;

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

    // 💡 새롭게 추가하는 숙소 등록 API
    @PreAuthorize("hasRole('HOST')")
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody AccommodationDto.RegisterRequest request,
            @AuthenticationPrincipal String email // JWT 필터에서 넣어둔 유저 이메일
    ) {
        String contentId = accommodationService.register(email, request);
        return ResponseEntity.ok("숙소 등록 완료! 숙소 ID: " + contentId);
    }
    @PreAuthorize("hasRole('HOST')")
    @GetMapping("/my")
    public ResponseEntity<List<AccommodationResponse>> getMyAccommodations(
            // 혹시 CustomUserDetails 같은 객체로 꺼내야 한다면 여기서 에러가 나거나 null일 수 있습니다.
            @AuthenticationPrincipal String email
    ) {
        // 💡 콘솔창에 이메일이 정상적으로 찍히는지 확인하는 코드!
        System.out.println("토큰에서 꺼낸 이메일: " + email);

        List<AccommodationResponse> myAccommodations = accommodationService.getMyAccommodations(email);
        return ResponseEntity.ok(myAccommodations);
    }
}