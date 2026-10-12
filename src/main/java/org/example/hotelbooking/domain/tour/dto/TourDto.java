package org.example.hotelbooking.domain.tour.dto;

import lombok.Builder;
import lombok.Getter;
import org.example.hotelbooking.domain.tour.entity.TourAttraction;
import org.example.hotelbooking.domain.tour.entity.TourImage;

import java.util.List;

public class TourDto {

    
    @Getter
    @Builder
    public static class SummaryResponse {
        private String contentId;
        private String contentTypeId;
        private String title;
        private String addr1;
        private String addr2;
        private String tel;
        private String useTime;
        private String restDate;
        private String useFee;
        private String firstImage;
        private String mapX;
        private String mapY;
        private String overview;

        public static SummaryResponse from(TourAttraction t) {
            return SummaryResponse.builder()
                    .contentId(t.getContentId())
                    .contentTypeId(t.getContentTypeId())
                    .title(t.getTitle())
                    .addr1(t.getAddr1())
                    .addr2(t.getAddr2())
                    .tel(t.getTel())
                    .useTime(t.getUseTime())
                    .restDate(t.getRestDate())
                    .useFee(t.getUseFee())
                    .firstImage(t.getFirstImage())
                    .mapX(t.getMapX())
                    .mapY(t.getMapY())
                    .overview(t.getOverview())
                    .build();
        }
    }

    
    @Getter
    @Builder
    public static class DetailResponse {
        private String contentId;
        private String contentTypeId;
        private String title;
        private String addr1;
        private String addr2;
        private String zipcode;
        private String tel;
        private String openDate;
        private String restDate;
        private String useTime;
        private String parking;
        private String useFee;
        private String parkingFee;
        private String firstImage;
        private String mapX;
        private String mapY;
        private String overview;
        private List<ImageItem> images;

        @Getter
        @Builder
        public static class ImageItem {
            private Long imageId;
            private String originImgUrl;
            private String imgName;
        }

        public static DetailResponse of(TourAttraction t, List<TourImage> tourImages) {
            return DetailResponse.builder()
                    .contentId(t.getContentId())
                    .contentTypeId(t.getContentTypeId())
                    .title(t.getTitle())
                    .addr1(t.getAddr1())
                    .addr2(t.getAddr2())
                    .zipcode(t.getZipcode())
                    .tel(t.getTel())
                    .openDate(t.getOpenDate())
                    .restDate(t.getRestDate())
                    .useTime(t.getUseTime())
                    .parking(t.getParking())
                    .useFee(t.getUseFee())
                    .parkingFee(t.getParkingFee())
                    .firstImage(t.getFirstImage())
                    .mapX(t.getMapX())
                    .mapY(t.getMapY())
                    .overview(t.getOverview())
                    .images(tourImages.stream()
                            .map(img -> ImageItem.builder()
                                    .imageId(img.getImageId())
                                    .originImgUrl(img.getOriginImgUrl())
                                    .imgName(img.getImgName())
                                    .build())
                            .toList())
                    .build();
        }
    }
}