package org.example.hotelbooking.domain.review.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.hotelbooking.domain.review.entity.Review;

import java.time.LocalDateTime;

public class ReviewDto {

    @Getter
    @NoArgsConstructor
    public static class CreateRequest {
        private Long reservationId;
        private Integer rating;
        private String content;
    }

    @Getter
    @NoArgsConstructor
    public static class ReplyRequest {
        private String reply;
    }

    @Getter
    @Builder
    public static class Response {
        private Long reviewId;
        private String contentId;
        private String stayTitle;
        private String roomTitle;
        private String authorName;
        private Integer rating;
        private String content;
        private LocalDateTime createdAt;
        private String hostReply;
        private LocalDateTime repliedAt;

        public static Response from(Review r) {
            return Response.builder()
                    .reviewId(r.getReviewId())
                    .contentId(r.getAccommodation().getContentId())
                    .stayTitle(r.getAccommodation().getTitle())
                    .roomTitle(r.getReservation() != null && r.getReservation().getRoom() != null
                            ? r.getReservation().getRoom().getRoomTitle()
                            : "기본 객실")
                    .authorName(r.getMember() != null ? r.getMember().getName() : "익명")
                    .rating(r.getRating())
                    .content(r.getContent())
                    .createdAt(r.getCreatedAt())
                    .hostReply(r.getHostReply())
                    .repliedAt(r.getRepliedAt())
                    .build();
        }
    }
}