package org.example.hotelbooking.domain.accommodation.dto;

import lombok.Builder;
import lombok.Getter;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.room.entity.Room;
import org.example.hotelbooking.domain.room.entity.RoomImage;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class StayDetailResponseDto {
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
    private String hostName;
    private String businessNo;
    private List<RoomDto> rooms;

    @Getter
    @Builder
    public static class RoomDto {
        private Long roomId;
        private String roomTitle;
        private String roomSize;
        private String roomBaseCount;
        private String roomMaxCount;
        private Integer pricePerNight;
        private List<String> imageUrls;
    }

    public static StayDetailResponseDto of(Accommodation a, List<Room> rooms, Map<Long, List<RoomImage>> roomImagesMap) {
        return StayDetailResponseDto.builder()
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
                .hostName(a.getHost() != null ? a.getHost().getName() : "제주야호 파트너")
                // 💡 2. 호스트가 존재하면 MEMBER 테이블의 businessNo 추출, 없으면 기본값 반환
                .businessNo(a.getHost() != null && a.getHost().getBusinessNo() != null
                        ? a.getHost().getBusinessNo()
                        : "등록된 사업자번호 없음")
                .rooms(rooms.stream().map(r -> {
                    List<RoomImage> rImages = roomImagesMap.getOrDefault(r.getRoomId(), List.of());

                    List<String> urls = rImages.stream()
                            .map(RoomImage::getImageUrl)
                            .toList();

                    return RoomDto.builder()
                            .roomId(r.getRoomId())
                            .roomTitle(r.getRoomTitle())
                            .roomSize(r.getRoomSize())
                            .roomBaseCount(r.getRoomBaseCount())
                            .roomMaxCount(r.getRoomMaxCount())
                            .pricePerNight(r.getPricePerNight())
                            .imageUrls(urls)
                            .build();
                }).toList())
                .build();
    }
}