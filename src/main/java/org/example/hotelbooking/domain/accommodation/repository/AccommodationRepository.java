package org.example.hotelbooking.domain.accommodation.repository;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AccommodationRepository extends JpaRepository<Accommodation, String>, AccommodationRepositoryCustom {

    @Query("SELECT new org.example.hotelbooking.domain.accommodation.dto.StayResponseDto(" +
            "a.contentId, a.host.memberId, a.title, a.lodgingType, a.tel, a.zipcode, a.addr, " +
            "a.checkinTime, a.checkoutTime, a.roomCount, a.roomType, a.parking, a.subFacility, " +
            "a.overview, a.firstImage, a.firstImage2, a.mapX, a.mapY, " +
            "COALESCE((SELECT MIN(r.pricePerNight) FROM Room r WHERE r.accommodation = a), 0), " +
            "COALESCE((SELECT SUM(ri.availableCount) FROM RoomInventory ri JOIN ri.room r " +
            "          WHERE r.accommodation = a " +
            "            AND ri.inventoryDate = :checkIn " +
            "            AND (:guests IS NULL OR :guests <= 0 OR CAST(COALESCE(r.roomMaxCount, '0') AS integer) >= :guests)), 0L)) " +
            "FROM Accommodation a " +
            "WHERE a.approvalStatus = org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus.APPROVED " +
            "  AND (:region IS NULL OR :region = '' OR :region = '전체' OR a.addr LIKE %:region%) " +
            "  AND (:type IS NULL OR :type = '' OR :type = '전체' OR a.lodgingType LIKE %:type%) " +
            "  AND (:query IS NULL OR :query = '' OR a.title LIKE %:query% OR a.addr LIKE %:query%) " +
            "  AND (:guests IS NULL OR :guests <= 0 OR EXISTS (" +
            "       SELECT 1 FROM Room r " +
            "       WHERE r.accommodation = a " +
            "         AND CAST(COALESCE(r.roomMaxCount, '0') AS integer) >= :guests)) " +
            
            "  AND (:stayDays = 0L OR EXISTS (" +
            "           SELECT 1 FROM Room r " +
            "           WHERE r.accommodation = a " +
            "             AND (SELECT COUNT(ri) FROM RoomInventory ri " +
            "                  WHERE ri.room = r " +
            "                    AND ri.inventoryDate >= :checkIn " +
            "                    AND ri.inventoryDate < :checkOut " +
            "                    AND ri.availableCount > 0) = :stayDays)) " +
            "ORDER BY a.contentId DESC")
    List<StayResponseDto> searchStays(
            @Param("region") String region,
            @Param("type") String type,
            @Param("query") String query,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("stayDays") Long stayDays,
            @Param("guests") Integer guests 
    );

    
    @Query(value = "SELECT SEQ_HOST_ACCOM.NEXTVAL FROM DUAL", nativeQuery = true)
    Long getNextHostAccomSeq();

    
    List<Accommodation> findByHost_Email(String email);

    
    boolean existsByHost_MemberIdAndApprovalStatus(Long memberId, org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus approvalStatus);

    
    List<Accommodation> findByHost_MemberIdAndApprovalStatus(Long memberId, AccommodationStatus approvalStatus);

    
    List<Accommodation> findByApprovalStatusOrderByCreatedAtDesc(AccommodationStatus approvalStatus);

    
    List<Accommodation> findByApprovalStatus(AccommodationStatus approvalStatus);
}