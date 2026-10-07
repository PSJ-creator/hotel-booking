package org.example.hotelbooking.domain.reservation.repository;

import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    // 💡 일반 유저가 본인의 예약 내역을 최신순으로 조회할 때 사용
    @Query("SELECT r FROM Reservation r " +
            "JOIN FETCH r.room rm " +
            "JOIN FETCH rm.accommodation a " +
            "WHERE r.member.memberId = :memberId " +
            "ORDER BY r.createdAt DESC")
    List<Reservation> findByMember_MemberIdOrderByCreatedAtDesc(@Param("memberId") Long memberId);

    // 💡 호스트가 본인 소유의 숙소에 접수된 모든 예약 내역을 조회할 때 사용 (JPQL 사용)
    @Query("SELECT r FROM Reservation r " +
            "JOIN FETCH r.member m " +
            "JOIN FETCH r.room rm " +
            "JOIN FETCH rm.accommodation a " +
            "WHERE a.host.memberId = :hostId " +
            "ORDER BY r.createdAt DESC")
    List<Reservation> findReservationsByHostId(@Param("hostId") Long hostId);

    // 💡 사이트 전체 누적 결제액 (취소된 예약 제외)
    @Query("SELECT COALESCE(SUM(r.totalPrice), 0L) FROM Reservation r WHERE r.status = 'COMPLETED'")
    Long getTotalSiteRevenue();
}