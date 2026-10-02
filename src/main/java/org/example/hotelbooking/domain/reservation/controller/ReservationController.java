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

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationLockFacade reservationLockFacade;
    private final MemberRepository memberRepository;
    private final ReservationService reservationService;

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

    // 내 예약 내역 목록 조회 API
    @GetMapping("/my")
    public ResponseEntity<List<ReservationDto.MyReservationResponse>> getMyReservations(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(reservationService.getMyReservations(email));
    }
    // 숙소 관리자(호스트): 내 숙소에 접수된 예약 내역 목록 조회 API
    @GetMapping("/host")
    public ResponseEntity<List<ReservationDto.HostReservationResponse>> getHostReservations(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(reservationService.getHostReservations(email));
    }

    // 예약 취소 API
    @PatchMapping("/{reservationId}/cancel")
    public ResponseEntity<String> cancelReservation(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal String email
    ) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        log.info("예약 취소 요청 수신 - ReservationId: {}, MemberId: {}", reservationId, member.getMemberId());
        reservationLockFacade.cancelReservationWithLock(reservationId, member.getMemberId());

        return ResponseEntity.ok("예약이 성공적으로 취소되었습니다.");
    }
}