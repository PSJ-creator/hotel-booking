package org.example.hotelbooking.domain.accommodation.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationDto;
import org.example.hotelbooking.domain.accommodation.dto.AdminRejectRequest;
import org.example.hotelbooking.domain.accommodation.service.AccommodationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/accommodations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAccommodationController {

    private final AccommodationService accommodationService;

    
    @GetMapping("/pending")
    public ResponseEntity<List<AccommodationDto.HostDetailResponse>> getPendingAccommodations() {
        return ResponseEntity.ok(accommodationService.getPendingAccommodations());
    }

    
    @PatchMapping("/{contentId}/approve")
    public ResponseEntity<String> approveAccommodation(@PathVariable String contentId) {
        accommodationService.approveAccommodation(contentId);
        return ResponseEntity.ok("숙소 ID " + contentId + "의 승인이 완료되었습니다.");
    }

    
    @PatchMapping("/{contentId}/reject")
    public ResponseEntity<String> rejectAccommodation(
            @PathVariable String contentId,
            @RequestBody AdminRejectRequest request
    ) {
        accommodationService.rejectAccommodation(contentId, request.getRejectReason());
        return ResponseEntity.ok("숙소 ID " + contentId + "가 반려 처리되었습니다.");
    }
}