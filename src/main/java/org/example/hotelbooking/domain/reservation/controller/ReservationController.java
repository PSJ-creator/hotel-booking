package org.example.hotelbooking.domain.reservation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelbooking.domain.reservation.dto.ReservationDto;
import org.example.hotelbooking.domain.reservation.facade.ReservationLockFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationLockFacade reservationLockFacade;

    @PostMapping
    public ResponseEntity<ReservationDto.Response> createReservation(@RequestBody ReservationDto.Request request) {
        log.info("예약 요청 수신 - MemberId: {}, RoomId: {}", request.getMemberId(), request.getRoomId());

        // 💡 1. 분산 락이 적용된 예약 퍼사드 호출
        reservationLockFacade.reserveRoomWithLock(
                request.getMemberId(),
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getTotalPrice()
        );

        // 💡 2. 성공 응답 반환
        ReservationDto.Response response = ReservationDto.Response.builder()
                .message("예약이 성공적으로 완료되었습니다.")
                .roomId(request.getRoomId())
                .status("COMPLETED")
                .build();

        return ResponseEntity.ok(response);
    }
    // 예약 취소 API
    @PatchMapping("/{reservationId}/cancel")
    public ResponseEntity<String> cancelReservation(
            @PathVariable Long reservationId,
            @RequestBody java.util.Map<String, Long> request // MVP용 임시 맵 (원래는 별도 DTO나 Security 사용)
    ) {
        Long memberId = request.get("memberId");
        log.info("예약 취소 요청 수신 - ReservationId: {}, MemberId: {}", reservationId, memberId);

        reservationLockFacade.cancelReservationWithLock(reservationId, memberId);

        return ResponseEntity.ok("예약이 성공적으로 취소되었습니다.");
    }
}