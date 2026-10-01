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
    // 💡 Fetch Join을 사용해 RoomInventory를 가져올 때 Room 정보도 한 번에(N+1 방지) 긁어옵니다.
    @Query("SELECT ri FROM RoomInventory ri JOIN FETCH ri.room r " +
            "WHERE r.accommodation.contentId = :contentId " + // ⚠️ Room 엔티티 안의 Accommodation 필드명에 맞게 수정!
            "AND ri.inventoryDate = :date " +
            "AND ri.availableCount > 0")
    List<RoomInventory> findAvailableRooms(
            @Param("contentId") Long contentId,
            @Param("date") LocalDate date
    );
}