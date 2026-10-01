package org.example.hotelbooking.domain.reservation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.reservation.dto.ReservationDto;
import org.example.hotelbooking.domain.reservation.facade.ReservationLockFacade;
import org.example.hotelbooking.domain.reservation.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationLockFacade reservationLockFacade;
    private final MemberRepository memberRepository;

    @PostMapping
    public ResponseEntity<ReservationDto.Response> createReservation(
            @RequestBody ReservationDto.Request request,
            @AuthenticationPrincipal String email // 💡 JWT 토큰에서 꺼낸 로그인 유저의 이메일
    ) {
        // 💡 토큰의 이메일로 DB 회원 조회 -> 실제 memberId(22L) 획득
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. email=" + email));

        reservationLockFacade.reserveRoomWithLock(
                member.getMemberId(), // 22L가 안전하게 전달됨
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