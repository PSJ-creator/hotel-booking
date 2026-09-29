package org.example.hotelbooking.domain.accommodation.entity;

import org.example.hotelbooking.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ACCOMMODATION")
public class Accommodation {

    @Id
    @Column(name = "CONTENT_ID", length = 20)
    private String contentId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "LODGING_TYPE", length = 50)
    private String lodgingType;

    @Column(length = 100)
    private String tel;

    @Column(length = 10)
    private String zipcode;

    @Column(length = 300)
    private String addr;

    @Column(name = "CHECKIN_TIME", length = 100)
    private String checkinTime;

    @Column(name = "CHECKOUT_TIME", length = 100)
    private String checkoutTime;

    @Column(name = "ROOM_COUNT", length = 50)
    private String roomCount;

    @Column(name = "ROOM_TYPE", length = 200)
    private String roomType;

    @Column(length = 300)
    private String parking;

    @Column(name = "SUB_FACILITY", length = 1000)
    private String subFacility;

    @Lob
    private String overview;

    @Column(name = "FIRST_IMAGE", length = 1000)
    private String firstImage;

    @Column(name = "FIRST_IMAGE2", length = 1000)
    private String firstImage2;

    @Column(name = "MAP_X", length = 50)
    private String mapX;

    @Column(name = "MAP_Y", length = 50)
    private String mapY;

    @Column(name = "APPROVAL_STATUS", length = 20)
    private String approvalStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMBER_ID")
    private Member host;

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.approvalStatus == null) this.approvalStatus = "APPROVED";
    }

    // Accommodation 엔티티에 생성자 추가
    @Builder
    public Accommodation(String contentId, String title, String lodgingType, String tel, String zipcode, String addr, String checkinTime, String checkoutTime, String roomCount, String roomType, String parking, String subFacility, String overview, String firstImage, String firstImage2, String mapX, String mapY, Member host) {
        this.contentId = contentId;
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
        this.host = host;
    }
}