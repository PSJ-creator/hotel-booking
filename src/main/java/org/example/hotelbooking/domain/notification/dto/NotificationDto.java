package org.example.hotelbooking.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationDto {
    private String id;        // 고유 식별자 (예: "REJECT_21", "RES_10")
    private String title;     // 알림 제목
    private String message;   // 알림 내용 (반려 사유 등)
    private String type;      // ACCOM_REJECT, RESERVATION_NEW, ACCOM_PENDING
    private LocalDateTime createdAt;
}