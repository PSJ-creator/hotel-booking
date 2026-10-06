package org.example.hotelbooking.domain.review.repository;

import org.example.hotelbooking.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 💡 특정 숙소에 달린 모든 리뷰를 최신순으로 가져오는 메서드
    @Query("SELECT rv FROM Review rv " +
            "JOIN FETCH rv.member m " +
            "JOIN FETCH rv.reservation res " +
            "JOIN FETCH res.room rm " +
            "WHERE rv.accommodation.contentId = :contentId " +
            "ORDER BY rv.createdAt DESC")
    List<Review> findByAccommodation_ContentIdOrderByCreatedAtDesc(@Param("contentId") String contentId);

    @Query("SELECT rv FROM Review rv " +
            "JOIN FETCH rv.member m " +
            "JOIN FETCH rv.accommodation a " +
            "JOIN FETCH rv.reservation res " +
            "JOIN FETCH res.room rm " +
            "WHERE a.host.email = :email " +
            "ORDER BY rv.createdAt DESC")
    List<Review> findAllByHostEmail(@Param("email") String email);

    @Query("SELECT rv FROM Review rv " +
            "JOIN FETCH rv.member m " +
            "JOIN FETCH rv.accommodation a " +
            "JOIN FETCH rv.reservation res " +
            "JOIN FETCH res.room rm " +
            "ORDER BY rv.createdAt DESC")
    List<Review> findAllWithDetails();

    // 💡 특정 예약건에 이미 리뷰가 작성되었는지 확인 (1예약 1리뷰 방어용)
    boolean existsByReservation_ReservationId(Long reservationId);

    // 💡 숙소 삭제 시 해당 숙소에 작성된 리뷰 일괄 삭제
    void deleteByAccommodation_ContentId(String contentId);
}