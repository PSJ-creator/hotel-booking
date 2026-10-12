package org.example.hotelbooking.domain.room.entity;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ROOM")
public class Room {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(name = "PRICE_PER_NIGHT")
    private Integer pricePerNight;

    
    @Builder
    public Room(Accommodation accommodation, String roomTitle, String roomSize,
                String roomBaseCount, String roomMaxCount, Integer pricePerNight) {
        this.accommodation = accommodation;
        this.roomTitle = roomTitle;
        this.roomSize = roomSize;
        this.roomBaseCount = roomBaseCount;
        this.roomMaxCount = roomMaxCount;
        this.pricePerNight = pricePerNight;
    }

    
    public void updateRoom(String roomTitle, String roomSize, String roomBaseCount,
                           String roomMaxCount, Integer pricePerNight) {
        this.roomTitle = roomTitle;
        this.roomSize = roomSize;
        this.roomBaseCount = roomBaseCount;
        this.roomMaxCount = roomMaxCount;
        this.pricePerNight = pricePerNight;
    }
}