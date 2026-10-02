package org.example.hotelbooking.domain.payment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.payment.dto.PaymentConfirmRequest;
import org.example.hotelbooking.domain.payment.service.TossPaymentService;
import org.example.hotelbooking.domain.reservation.facade.ReservationLockFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final TossPaymentService tossPaymentService;
    private final ReservationLockFacade reservationLockFacade;
    private final MemberRepository memberRepository;

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPayment(
            @RequestBody PaymentConfirmRequest request,
            @AuthenticationPrincipal String email
    ) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        // 1. 토스페이먼츠 서버로 결제 승인(Confirm) 요청 (돈이 빠져나감)
        tossPaymentService.confirmPayment(request.getPaymentKey(), request.getOrderId(), request.getAmount());

        // 2. 결제가 승인되었으니, 우리 DB에 락을 걸고 객실 예약을 시도합니다.
        try {
            reservationLockFacade.reserveRoomWithLock(
                    member.getMemberId(),
                    request.getRoomId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate(),
                    request.getAmount()
            );
            return ResponseEntity.ok("결제 및 예약이 성공적으로 완료되었습니다.");

        } catch (Exception e) {
            // 🚨 3. 치명적 예외: 돈은 나갔는데, 그 찰나의 순간에 방이 매진되어 DB 에러가 터졌다면?
            log.error("예약 DB 저장 실패! 유저의 돈을 즉시 환불합니다. 사유: {}", e.getMessage());

            // 보상 트랜잭션: 토스 서버로 즉시 결제 취소 API를 쏴서 전액 환불 조치
            tossPaymentService.cancelPayment(request.getPaymentKey(), "객실 매진으로 인한 자동 환불");

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("결제가 진행되었으나 찰나의 순간에 객실이 매진되었습니다. 안전하게 전액 환불되었습니다.");
        }
    }
}