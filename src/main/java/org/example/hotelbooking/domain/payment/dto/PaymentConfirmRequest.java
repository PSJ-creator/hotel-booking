package org.example.hotelbooking.domain.payment.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class PaymentConfirmRequest {
    private String paymentKey;
    private String orderId;
    private Integer amount;

    // 예약에 필요한 부가 정보
    private Long roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
}