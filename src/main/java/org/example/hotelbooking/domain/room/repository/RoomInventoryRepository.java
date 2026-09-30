package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.RoomInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomInventoryRepository extends JpaRepository<RoomInventory, Long> {

    // 특정 객실의 특정 날짜 구간 재고 조회
    @Query("SELECT ri FROM RoomInventory ri WHERE ri.room.roomId = :roomId AND ri.inventoryDate BETWEEN :checkIn AND :checkOut")
    List<RoomInventory> findInventoriesForReservation(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}