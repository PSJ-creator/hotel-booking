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
        
        private String firstImage;
        private String firstImage2;
        private String mapX;
        private String mapY;
    }

    
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