package org.example.hotelbooking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ROOM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ROOM_ID")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONTENT_ID", nullable = false)
    private Accommodation accommodation;

    @Column(name = "ROOM_TITLE", length = 100)
    private String roomTitle;

    @Column(name = "ROOM_SIZE", length = 50)
    private String roomSize;

    @Column(name = "ROOM_BASE_COUNT", length = 20)
    private String roomBaseCount;

    @Column(name = "ROOM_MAX_COUNT", length = 20)
    private String roomMaxCount;

    @Column(name = "PRICE_PER_NIGHT", precision = 12, scale = 2)
    private BigDecimal pricePerNight;
}