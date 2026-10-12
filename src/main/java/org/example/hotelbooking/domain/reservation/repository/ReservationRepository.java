package org.example.hotelbooking.domain.reservation.repository;

import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    @Query("SELECT r FROM Reservation r " +
            "JOIN FETCH r.room rm " +
            "JOIN FETCH rm.accommodation a " +
            "WHERE r.member.memberId = :memberId " +
            "ORDER BY r.createdAt DESC")
    List<Reservation> findByMember_MemberIdOrderByCreatedAtDesc(@Param("memberId") Long memberId);

    
    @Query("SELECT r FROM Reservation r " +
            "JOIN FETCH r.member m " +
            "JOIN FETCH r.room rm " +
            "JOIN FETCH rm.accommodation a " +
            "WHERE a.host.memberId = :hostId " +
            "ORDER BY r.createdAt DESC")
    List<Reservation> findReservationsByHostId(@Param("hostId") Long hostId);
}