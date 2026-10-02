package org.example.hotelbooking.domain.tour.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "TOUR_ATTRACTION")
public class TourAttraction {

    @Id
    @Column(name = "CONTENT_ID", length = 20)
    private String contentId;

    @Column(name = "CONTENT_TYPE_ID", length = 10)
    private String contentTypeId;

    @Column(name = "TITLE", nullable = false, length = 300)
    private String title;

    @Column(name = "ADDR1", length = 500)
    private String addr1;

    @Column(name = "ADDR2", length = 300)
    private String addr2;

    @Column(name = "ZIPCODE", length = 20)
    private String zipcode;

    @Column(name = "TEL", length = 300)
    private String tel;

    @Column(name = "OPEN_DATE", length = 100)
    private String openDate;

    @Column(name = "REST_DATE", length = 300)
    private String restDate;

    @Column(name = "USE_TIME", length = 500)
    private String useTime;

    @Column(name = "PARKING", length = 500)
    private String parking;

    @Column(name = "USE_FEE", length = 500)
    private String useFee;

    @Column(name = "PARKING_FEE", length = 300)
    private String parkingFee;

    @Column(name = "FIRST_IMAGE", length = 1000)
    private String firstImage;

    @Column(name = "MAP_X", length = 50)
    private String mapX;

    @Column(name = "MAP_Y", length = 50)
    private String mapY;

    @Lob
    @Column(name = "OVERVIEW")
    private String overview;

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}