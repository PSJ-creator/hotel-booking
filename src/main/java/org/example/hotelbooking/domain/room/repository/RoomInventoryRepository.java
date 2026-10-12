package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.RoomInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomInventoryRepository extends JpaRepository<RoomInventory, Long> {

    
    @Query("SELECT ri FROM RoomInventory ri WHERE ri.room.roomId = :roomId AND ri.inventoryDate BETWEEN :checkIn AND :checkOut")
    List<RoomInventory> findInventoriesForReservation(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
    
    @Query("SELECT ri FROM RoomInventory ri JOIN FETCH ri.room r " +
            "WHERE r.accommodation.contentId = :contentId " + 
            "AND ri.inventoryDate = :date " +
            "AND ri.availableCount > 0")
    List<RoomInventory> findAvailableRooms(
            @Param("contentId") Long contentId,
            @Param("date") LocalDate date
    );

    
    @Query("SELECT ri FROM RoomInventory ri " +
            "WHERE ri.room.accommodation.contentId = :contentId " +
            "  AND ri.inventoryDate >= :checkIn " +
            "  AND ri.inventoryDate < :checkOut")
    List<RoomInventory> findByContentIdAndDateRange(
            @Param("contentId") String contentId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    
    void deleteByRoom_RoomId(Long roomId);
}