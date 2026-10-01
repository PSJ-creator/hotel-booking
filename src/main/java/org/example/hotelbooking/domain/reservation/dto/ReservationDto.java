package org.example.hotelbooking.domain.reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

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
}