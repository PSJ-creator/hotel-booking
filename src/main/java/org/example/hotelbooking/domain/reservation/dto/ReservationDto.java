package org.example.hotelbooking.domain.reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.example.hotelbooking.domain.room.entity.Room;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Request {
        private Long roomId;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer totalPrice;
    }

    @Getter
    public static class Response {
        private String message;
        private Long roomId;
        private String status;

        @Builder
        public Response(String message, Long roomId, String status) {
            this.message = message;
            this.roomId = roomId;
            this.status = status;
        }
    }

    // 💡 내 예약 내역 조회 응답 DTO
    @Getter
    @Builder
    public static class MyReservationResponse {
        private Long reservationId;
        private String status;           // COMPLETED, CANCELED
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer totalPrice;
        private LocalDateTime createdAt;

        // 숙소 정보
        private String contentId;
        private String stayTitle;
        private String lodgingType;
        private String addr;
        private String tel;
        private String firstImage;
        private String checkinTime;
        private String checkoutTime;

        // 객실 정보
        private Long roomId;
        private String roomTitle;
        private String roomBaseCount;
        private String roomMaxCount;

        // 리뷰 작성 여부
        private boolean hasReview;

        public static MyReservationResponse of(Reservation r, boolean hasReview) {
            Room room = r.getRoom();
            Accommodation accom = room.getAccommodation();

            return MyReservationResponse.builder()
                    .reservationId(r.getReservationId())
                    .status(r.getStatus())
                    .checkInDate(r.getCheckInDate())
                    .checkOutDate(r.getCheckOutDate())
                    .totalPrice(r.getTotalPrice())
                    .createdAt(r.getCreatedAt())
                    .contentId(accom.getContentId())
                    .stayTitle(accom.getTitle())
                    .lodgingType(accom.getLodgingType())
                    .addr(accom.getAddr())
                    .tel(accom.getTel())
                    .firstImage(accom.getFirstImage() != null ? accom.getFirstImage() : accom.getFirstImage2())
                    .checkinTime(accom.getCheckinTime())
                    .checkoutTime(accom.getCheckoutTime())
                    .roomId(room.getRoomId())
                    .roomTitle(room.getRoomTitle())
                    .roomBaseCount(room.getRoomBaseCount())
                    .roomMaxCount(room.getRoomMaxCount())
                    .hasReview(hasReview)
                    .build();
        }
    }

    // 💡 [신규 추가] 숙소 관리자(호스트)용 예약 관리 조회 응답 DTO
    @Getter
    @Builder
    public static class HostReservationResponse {
        private Long reservationId;
        private String status;           // COMPLETED, CANCELED
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer totalPrice;
        private LocalDateTime createdAt;

        // 예약자(게스트) 정보
        private Long guestId;
        private String guestName;
        private String guestEmail;

        // 숙소 및 객실 정보
        private String contentId;
        private String stayTitle;
        private String firstImage;
        private Long roomId;
        private String roomTitle;
        private String roomBaseCount;
        private String roomMaxCount;

        public static HostReservationResponse from(Reservation r) {
            Member guest = r.getMember();
            Room room = r.getRoom();
            Accommodation accom = room.getAccommodation();

            return HostReservationResponse.builder()
                    .reservationId(r.getReservationId())
                    .status(r.getStatus())
                    .checkInDate(r.getCheckInDate())
                    .checkOutDate(r.getCheckOutDate())
                    .totalPrice(r.getTotalPrice())
                    .createdAt(r.getCreatedAt())
                    .guestId(guest.getMemberId())
                    .guestName(guest.getName())
                    .guestEmail(guest.getEmail())
                    .contentId(accom.getContentId())
                    .stayTitle(accom.getTitle())
                    .firstImage(accom.getFirstImage() != null ? accom.getFirstImage() : accom.getFirstImage2())
                    .roomId(room.getRoomId())
                    .roomTitle(room.getRoomTitle())
                    .roomBaseCount(room.getRoomBaseCount())
                    .roomMaxCount(room.getRoomMaxCount())
                    .build();
        }
    }
}