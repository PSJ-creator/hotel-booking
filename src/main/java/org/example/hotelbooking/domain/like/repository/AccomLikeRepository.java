package org.example.hotelbooking.domain.like.repository;

import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.like.entity.AccomLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AccomLikeRepository extends JpaRepository<AccomLike, Long> {
    boolean existsByMember_MemberIdAndAccommodation_ContentId(Long memberId, String contentId);

    Optional<AccomLike> findByMember_MemberIdAndAccommodation_ContentId(Long memberId, String contentId);

    List<AccomLike> findByMember_MemberIdOrderByCreatedAtDesc(Long memberId);

    
    @Query("SELECT new org.example.hotelbooking.domain.accommodation.dto.StayResponseDto(" +
            "a.contentId, a.host.memberId, a.title, a.lodgingType, a.tel, a.zipcode, a.addr, " +
            "a.checkinTime, a.checkoutTime, a.roomCount, a.roomType, a.parking, a.subFacility, " +
            "a.overview, a.firstImage, a.firstImage2, a.mapX, a.mapY, " +
            "COALESCE((SELECT MIN(r.pricePerNight) FROM Room r WHERE r.accommodation = a), 0), " +
            "COALESCE((SELECT SUM(ri.availableCount) FROM RoomInventory ri JOIN ri.room r " +
            "          WHERE r.accommodation = a " +
            "            AND ri.inventoryDate = :checkIn " +
            "            AND (:guests IS NULL OR :guests <= 0 OR CAST(COALESCE(r.roomMaxCount, '0') AS integer) >= :guests)), 0L)) " +
            "FROM AccomLike al " +
            "JOIN al.accommodation a " +
            "WHERE al.member.memberId = :memberId " +
            
            "  AND (:guests IS NULL OR :guests <= 0 OR EXISTS (" +
            "       SELECT 1 FROM Room r " +
            "       WHERE r.accommodation = a " +
            "         AND CAST(COALESCE(r.roomMaxCount, '0') AS integer) >= :guests)) " +
            
            "  AND (:stayDays = 0L OR EXISTS (" +
            "       SELECT 1 FROM Room r " +
            "       WHERE r.accommodation = a " +
            "         AND (:guests IS NULL OR :guests <= 0 OR CAST(COALESCE(r.roomMaxCount, '0') AS integer) >= :guests) " +
            "         AND (SELECT COUNT(ri) FROM RoomInventory ri " +
            "              WHERE ri.room = r " +
            "                AND ri.inventoryDate >= :checkIn " +
            "                AND ri.inventoryDate < :checkOut " +
            "                AND ri.availableCount > 0) = :stayDays)) " +
            "ORDER BY al.createdAt DESC")
    List<StayResponseDto> findWishlistStaysByMemberIdAndDates(
            @Param("memberId") Long memberId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("stayDays") Long stayDays,
            @Param("guests") Integer guests
    );

    
    void deleteByAccommodation_ContentId(String contentId);
}