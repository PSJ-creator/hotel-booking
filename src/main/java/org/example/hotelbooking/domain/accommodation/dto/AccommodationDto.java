package org.example.hotelbooking.domain.accommodation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;

public class AccommodationDto {

    @Getter
    @NoArgsConstructor
    public static class RegisterRequest {
        private String contentId;
        private String title;
        private String lodgingType;
        private String tel;
        private String zipcode;
        private String addr;
        private String checkinTime;
        private String checkoutTime;
        private String roomCount;
        private String roomType;
        private String parking;
        private String subFacility;
        private String overview;
        // 💡 [누락되었던 4개 필드 추가]
        private String firstImage;
        private String firstImage2;
        private String mapX;
        private String mapY;
    }

    // 숙소 관리자 숙소 수정 요청 DTO
    @Getter
    @NoArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String lodgingType;
        private String tel;
        private String zipcode;
        private String addr;
        private String checkinTime;
        private String checkoutTime;
        private String roomCount;
        private String roomType;
        private String parking;
        private String subFacility;
        private String overview;
        private String firstImage;
        private String firstImage2;
        private String mapX;
        private String mapY;
    }

    // 호스트 내 숙소 조회용 상세 응답 DTO (DB의 모든 컬럼 + 승인상태/반려사유 반환)
    // 💡 호스트 내 숙소 조회 및 총괄 관리자 심사 공용 상세 응답 DTO
    @Getter
    @Builder
    public static class HostDetailResponse {
        private String contentId;
        private String title;
        private String lodgingType;
        private String tel;
        private String zipcode;
        private String addr;
        private String checkinTime;
        private String checkoutTime;
        private String roomCount;
        private String roomType;
        private String parking;
        private String subFacility;
        private String overview;
        private String firstImage;
        private String firstImage2;
        private String mapX;
        private String mapY;
        private String approvalStatus;
        private String rejectReason;
        // 💡 관리자 심사용 호스트 정보 및 등록일시 추가
        private String hostName;
        private String hostEmail;
        private String businessNo;
        private java.time.LocalDateTime createdAt;

        public static HostDetailResponse from(Accommodation a) {
            return HostDetailResponse.builder()
                    .contentId(a.getContentId())
                    .title(a.getTitle())
                    .lodgingType(a.getLodgingType())
                    .tel(a.getTel())
                    .zipcode(a.getZipcode())
                    .addr(a.getAddr())
                    .checkinTime(a.getCheckinTime())
                    .checkoutTime(a.getCheckoutTime())
                    .roomCount(a.getRoomCount())
                    .roomType(a.getRoomType())
                    .parking(a.getParking())
                    .subFacility(a.getSubFacility())
                    .overview(a.getOverview())
                    .firstImage(a.getFirstImage())
                    .firstImage2(a.getFirstImage2())
                    .mapX(a.getMapX())
                    .mapY(a.getMapY())
                    .approvalStatus(a.getApprovalStatus() != null ? a.getApprovalStatus().name() : "PENDING")
                    .rejectReason(a.getRejectReason())
                    .hostName(a.getHost() != null ? a.getHost().getName() : "정보 없음")
                    .hostEmail(a.getHost() != null ? a.getHost().getEmail() : "")
                    .businessNo(a.getHost() != null ? a.getHost().getBusinessNo() : "")
                    .createdAt(a.getCreatedAt())
                    .build();
        }
    }
}