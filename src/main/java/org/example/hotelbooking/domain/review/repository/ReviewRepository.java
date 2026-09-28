package org.example.hotelbooking.domain.review.repository;

import org.example.hotelbooking.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 💡 특정 숙소에 달린 모든 리뷰를 최신순으로 가져오는 메서드
    List<Review> findByAccommodation_ContentIdOrderByCreatedAtDesc(String contentId);

    // 💡 특정 예약건에 이미 리뷰가 작성되었는지 확인 (1예약 1리뷰 방어용)
    boolean existsByReservation_ReservationId(Long reservationId);
}