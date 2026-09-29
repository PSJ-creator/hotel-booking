package org.example.hotelbooking.domain.accommodation.repository;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccommodationRepository extends JpaRepository<Accommodation, String>, AccommodationRepositoryCustom {

    @Query("SELECT new org.example.hotelbooking.domain.accommodation.dto.StayResponseDto(" +
            "a.contentId, a.host.memberId, a.title, a.lodgingType, a.tel, a.zipcode, a.addr, " +
            "a.checkinTime, a.checkoutTime, a.roomCount, a.roomType, a.parking, a.subFacility, " +
            "a.overview, a.firstImage, a.firstImage2, a.mapX, a.mapY, " +
            "COALESCE((SELECT MIN(r.pricePerNight) FROM Room r WHERE r.accommodation = a), 0)) " +
            "FROM Accommodation a " +
            "WHERE (:region IS NULL OR :region = '' OR :region = '전체' OR a.addr LIKE %:region%) " +
            "  AND (:type IS NULL OR :type = '' OR :type = '전체' OR a.lodgingType LIKE %:type%) " +
            "  AND (:query IS NULL OR :query = '' OR a.title LIKE %:query% OR a.addr LIKE %:query%) " +
            "ORDER BY a.contentId DESC")
    List<StayResponseDto> searchStays(
            @Param("region") String region,
            @Param("type") String type,
            @Param("query") String query
    );
}