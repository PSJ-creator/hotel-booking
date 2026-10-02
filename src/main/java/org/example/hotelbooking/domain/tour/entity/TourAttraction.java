package org.example.hotelbooking.domain.tour.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "TOUR_ATTRACTION")
public class TourAttraction {
    @Id
    @Column(name = "CONTENT_ID")
    private String contentId;

    private String title;
    private String tel;

    @Column(name = "FIRST_IMAGE")
    private String firstImage;

    @Column(name = "MAP_X")
    private String mapX;

    @Column(name = "MAP_Y")
    private String mapY;
}