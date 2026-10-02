package org.example.hotelbooking.domain.accommodation.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class StayResponseDto {
    private String contentId;
    private Long memberId;
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
    private BigDecimal basePrice;   // 객실 최저가
    private Long remainingRooms;    // 💡 [신규 추가] 잔여 객실 수

    // 기존 생성자 유지 (호환용)
    public StayResponseDto(String contentId, Long memberId, String title, String lodgingType,
                           String tel, String zipcode, String addr, String checkinTime,
                           String checkoutTime, String roomCount, String roomType,
                           String parking, String subFacility, String overview,
                           String firstImage, String firstImage2, String mapX, String mapY,
                           BigDecimal basePrice) {
        this(contentId, memberId, title, lodgingType, tel, zipcode, addr, checkinTime,
                checkoutTime, roomCount, roomType, parking, subFacility, overview,
                firstImage, firstImage2, mapX, mapY, basePrice, 0L);
    }

    public StayResponseDto(String contentId, Long memberId, String title, String lodgingType,
                           String tel, String zipcode, String addr, String checkinTime,
                           String checkoutTime, String roomCount, String roomType,
                           String parking, String subFacility, String overview,
                           String firstImage, String firstImage2, String mapX, String mapY,
                           Integer basePrice) {
        this(contentId, memberId, title, lodgingType, tel, zipcode, addr, checkinTime,
                checkoutTime, roomCount, roomType, parking, subFacility, overview,
                firstImage, firstImage2, mapX, mapY,
                basePrice != null ? BigDecimal.valueOf(basePrice) : BigDecimal.ZERO, 0L);
    }

    // 💡 [신규 추가] 잔여 객실 수(remainingRooms) 포함 생성자
    public StayResponseDto(String contentId, Long memberId, String title, String lodgingType,
                           String tel, String zipcode, String addr, String checkinTime,
                           String checkoutTime, String roomCount, String roomType,
                           String parking, String subFacility, String overview,
                           String firstImage, String firstImage2, String mapX, String mapY,
                           BigDecimal basePrice, Long remainingRooms) {
        this.contentId = contentId;
        this.memberId = memberId;
        this.title = title;
        this.lodgingType = lodgingType;
        this.tel = tel;
        this.zipcode = zipcode;
        this.addr = addr;
        this.checkinTime = checkinTime;
        this.checkoutTime = checkoutTime;
        this.roomCount = roomCount;
        this.roomType = roomType;
        this.parking = parking;
        this.subFacility = subFacility;
        this.overview = overview;
        this.firstImage = firstImage;
        this.firstImage2 = firstImage2;
        this.mapX = mapX;
        this.mapY = mapY;
        this.basePrice = (basePrice != null) ? basePrice : BigDecimal.ZERO;
        this.remainingRooms = (remainingRooms != null) ? remainingRooms : 0L;
    }

    // 💡 [신규 추가] JPQL 매핑용 (Integer basePrice + Long remainingRooms)
    public StayResponseDto(String contentId, Long memberId, String title, String lodgingType,
                           String tel, String zipcode, String addr, String checkinTime,
                           String checkoutTime, String roomCount, String roomType,
                           String parking, String subFacility, String overview,
                           String firstImage, String firstImage2, String mapX, String mapY,
                           Integer basePrice, Long remainingRooms) {
        this(contentId, memberId, title, lodgingType, tel, zipcode, addr, checkinTime,
                checkoutTime, roomCount, roomType, parking, subFacility, overview,
                firstImage, firstImage2, mapX, mapY,
                basePrice != null ? BigDecimal.valueOf(basePrice) : BigDecimal.ZERO,
                remainingRooms != null ? remainingRooms : 0L);
    }
}