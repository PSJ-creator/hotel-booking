package org.example.hotelbooking.domain.tour.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "TOUR_IMAGE")
public class TourImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IMAGE_ID")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONTENT_ID", nullable = false)
    private TourAttraction tourAttraction;

    @Column(name = "ORIGIN_IMG_URL", nullable = false, length = 1000)
    private String originImgUrl;

    @Column(name = "IMG_NAME", length = 300)
    private String imgName;

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}