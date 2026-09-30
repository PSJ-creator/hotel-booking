package org.example.hotelbooking.domain.accommodation.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationResponse;
import org.example.hotelbooking.domain.accommodation.dto.AdminRejectRequest;
import org.example.hotelbooking.domain.accommodation.service.AccommodationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/accommodations")
@PreAuthorize("hasRole('ADMIN')") // 💡 관리자 권한 필수
public class AdminAccommodationController {

    private final AccommodationService accommodationService;

    // 1. 대기 중인 숙소 목록 조회
    @GetMapping("/pending")
    public ResponseEntity<List<AccommodationResponse>> getPendingAccommodations() {
        return ResponseEntity.ok(accommodationService.getPendingAccommodations());
    }

    // 2. 숙소 승인
    @PatchMapping("/{contentId}/approve")
    public ResponseEntity<String> approveAccommodation(@PathVariable String contentId) {
        accommodationService.approveAccommodation(contentId);
        return ResponseEntity.ok("숙소 ID " + contentId + "의 승인이 완료되었습니다.");
    }

    // 3. 숙소 반려
    @PatchMapping("/{contentId}/reject")
    public ResponseEntity<String> rejectAccommodation(
            @PathVariable String contentId,
            @RequestBody AdminRejectRequest request
    ) {
        accommodationService.rejectAccommodation(contentId, request.getRejectReason());
        return ResponseEntity.ok("숙소 ID " + contentId + "가 반려 처리되었습니다.");
    }
}