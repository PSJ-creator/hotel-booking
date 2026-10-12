package org.example.hotelbooking.domain.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ROOM_INVENTORY")
public class RoomInventory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "INVENTORY_ID")
    private Long inventoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROOM_ID", nullable = false)
    private Room room;

    @Column(name = "INVENTORY_DATE", nullable = false)
    private LocalDate inventoryDate; 

    @Column(name = "AVAILABLE_COUNT", nullable = false)
    private Integer availableCount; 

    @Builder
    public RoomInventory(Room room, LocalDate inventoryDate, Integer availableCount) {
        this.room = room;
        this.inventoryDate = inventoryDate;
        this.availableCount = availableCount;
    }

    
    public void decreaseCount(int count) {
        if (this.availableCount - count < 0) {
            throw new IllegalArgumentException("해당 날짜의 객실이 모두 예약되었습니다.");
        }
        this.availableCount -= count;
    }
    
    public void increaseCount(int count) {
        this.availableCount += count;
    }
}