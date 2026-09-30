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
    private LocalDate inventoryDate; // 예: 2026-10-01

    @Column(name = "AVAILABLE_COUNT", nullable = false)
    private Integer availableCount; // 남은 객실 수

    @Builder
    public RoomInventory(Room room, LocalDate inventoryDate, Integer availableCount) {
        this.room = room;
        this.inventoryDate = inventoryDate;
        this.availableCount = availableCount;
    }

    // 💡 동시성 환경에서 호출될 재고 차감 로직
    public void decreaseCount(int count) {
        if (this.availableCount - count < 0) {
            throw new IllegalArgumentException("해당 날짜의 객실이 모두 예약되었습니다.");
        }
        this.availableCount -= count;
    }
    // 💡 예약 취소 시 재고 복구 로직
    public void increaseCount(int count) {
        this.availableCount += count;
    }
}