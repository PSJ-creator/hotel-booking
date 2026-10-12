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
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final TossPaymentService tossPaymentService;
    private final ReservationLockFacade reservationLockFacade;
    private final MemberRepository memberRepository;

    @GetMapping("/client-key")
    public ResponseEntity<Map<String, String>> getClientKey() {
        return ResponseEntity.ok(Map.of("clientKey", tossPaymentService.getTossClientKey()));
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPayment(
            @RequestBody PaymentConfirmRequest request,
            @AuthenticationPrincipal String email
    ) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        
        tossPaymentService.confirmPayment(request.getPaymentKey(), request.getOrderId(), request.getAmount());

        
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
            
            log.error("예약 DB 저장 실패! 유저의 돈을 즉시 환불합니다. 사유: {}", e.getMessage());

            
            tossPaymentService.cancelPayment(request.getPaymentKey(), "객실 매진으로 인한 자동 환불");

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("결제가 진행되었으나 찰나의 순간에 객실이 매진되었습니다. 안전하게 전액 환불되었습니다.");
        }
    }
}