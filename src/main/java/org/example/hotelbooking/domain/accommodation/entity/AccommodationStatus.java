package org.example.hotelbooking.domain.accommodation.entity;
// 숙소 상태 enum 추가
public enum AccommodationStatus {
    PENDING,  // 승인 대기 (진행중)
    APPROVED, // 승인 완료 (홈페이지 노출)
    REJECTED  // 반려
}