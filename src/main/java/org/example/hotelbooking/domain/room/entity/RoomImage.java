package org.example.hotelbooking.domain.room.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ROOM_IMAGE")
public class RoomImage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IMAGE_ID")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROOM_ID", nullable = false)
    private Room room;

    @Column(name = "IMAGE_URL", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "DISPLAY_ORDER")
    private Integer displayOrder;

    @Builder
    public RoomImage(Room room, String imageUrl, Integer displayOrder) {
        this.room = room;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
    }
}