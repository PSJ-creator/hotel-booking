package org.example.hotelbooking.domain.accommodation.repository;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus;
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
            "WHERE a.approvalStatus = org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus.APPROVED " +
            "  AND (:region IS NULL OR :region = '' OR :region = '전체' OR a.addr LIKE %:region%) " +
            "  AND (:type IS NULL OR :type = '' OR :type = '전체' OR a.lodgingType LIKE %:type%) " +
            "  AND (:query IS NULL OR :query = '' OR a.title LIKE %:query% OR a.addr LIKE %:query%) " +
            // 💡 핵심 추가: 선택한 날짜에 방이 1개 이상 남아있는 객실을 보유한 숙소만 필터링
            "  AND (CAST(:date AS date) IS NULL OR EXISTS (" +
            "       SELECT 1 FROM RoomInventory ri " +
            "       WHERE ri.room.accommodation = a " +
            "         AND ri.inventoryDate = :date " +
            "         AND ri.availableCount > 0)) " +

            "ORDER BY a.contentId DESC")
    List<StayResponseDto> searchStays(
            @Param("region") String region,
            @Param("type") String type,
            @Param("query") String query,
            @Param("date") java.time.LocalDate date // 💡 날짜 파라미터 추가
    );
    // 숙소 생성시 시퀀스 생성
    @Query(value = "SELECT SEQ_HOST_ACCOM.NEXTVAL FROM DUAL", nativeQuery = true)
    Long getNextHostAccomSeq();

    // 호스트가 등록한 숙소 찾아오는 jpa쿼리
    List<Accommodation> findByHost_Email(String email);

    // 숙소 관리자의 숙소 보유 여부 확인
    boolean existsByHost_MemberIdAndApprovalStatus(Long memberId, org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus approvalStatus);

    // 특정 호스트의 반려된 숙소 목록 조회 (반려 알림용)
    List<Accommodation> findByHost_MemberIdAndApprovalStatus(Long memberId, AccommodationStatus approvalStatus);

    // 총괄 관리자용: 승인 대기(PENDING) 상태 숙소 목록 조회 (심사 알림용)
    List<Accommodation> findByApprovalStatusOrderByCreatedAtDesc(AccommodationStatus approvalStatus);

    // pending 상태인 숙소 목록 가져오는 메서드
    List<Accommodation> findByApprovalStatus(AccommodationStatus approvalStatus);
}