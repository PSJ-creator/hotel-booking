package org.example.hotelbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ACCOMMODATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Accommodation {

    @Id
    @Column(name = "CONTENT_ID", length = 20)
    private String contentId;

    @Column(name = "MEMBER_ID")
    private Long memberId;

    @Column(name = "TITLE", length = 200, nullable = false)
    private String title;

    @Column(name = "LODGING_TYPE", length = 50)
    private String lodgingType;

    @Column(name = "TEL", length = 100)
    private String tel;

    @Column(name = "ZIPCODE", length = 10)
    private String zipcode;

    @Column(name = "ADDR", length = 300)
    private String addr;

    @Column(name = "CHECKIN_TIME", length = 100)
    private String checkinTime;

    @Column(name = "CHECKOUT_TIME", length = 100)
    private String checkoutTime;

    @Column(name = "ROOM_COUNT", length = 50)
    private String roomCount;

    @Column(name = "ROOM_TYPE", length = 200)
    private String roomType;

    @Column(name = "PARKING", length = 300)
    private String parking;

    @Column(name = "SUB_FACILITY", length = 1000)
    private String subFacility;

    @Lob
    @Column(name = "OVERVIEW")
    private String overview;

    @Column(name = "FIRST_IMAGE", length = 1000)
    private String firstImage;

    @Column(name = "FIRST_IMAGE2", length = 1000)
    private String firstImage2;

    @Column(name = "MAP_X", length = 50)
    private String mapX;

    @Column(name = "MAP_Y", length = 50)
    private String mapY;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    // 1:N 연관관계 매핑 (세부 객실 목록)
    @OneToMany(mappedBy = "accommodation", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Room> rooms = new ArrayList<>();
}