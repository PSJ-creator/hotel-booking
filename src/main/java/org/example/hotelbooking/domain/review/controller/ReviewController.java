package org.example.hotelbooking.domain.review.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.review.dto.ReviewDto;
import org.example.hotelbooking.domain.review.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    
    @GetMapping("/stays/{contentId}")
    public ResponseEntity<List<ReviewDto.Response>> getStayReviews(@PathVariable String contentId) {
        return ResponseEntity.ok(reviewService.getReviewsByStay(contentId));
    }

    
    @PostMapping
    public ResponseEntity<?> createReview(
            @AuthenticationPrincipal String email,
            @RequestBody ReviewDto.CreateRequest request
    ) {
        try {
            reviewService.createReview(email, request);
            return ResponseEntity.ok(Map.of("message", "소중한 리뷰가 등록되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    
    @GetMapping("/host")
    public ResponseEntity<List<ReviewDto.Response>> getHostReviews(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(reviewService.getManageReviews(email));
    }

    
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<?> saveReply(
            @PathVariable Long reviewId,
            @RequestBody ReviewDto.ReplyRequest request,
            @AuthenticationPrincipal String email
    ) {
        try {
            reviewService.saveReply(email, reviewId, request.getReply());
            return ResponseEntity.ok(Map.of("message", "답글이 저장되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    
    @DeleteMapping("/{reviewId}/reply")
    public ResponseEntity<?> deleteReply(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal String email
    ) {
        try {
            reviewService.deleteReply(email, reviewId);
            return ResponseEntity.ok(Map.of("message", "답글이 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}