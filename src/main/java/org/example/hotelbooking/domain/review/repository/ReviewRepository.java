package org.example.hotelbooking.domain.review.repository;

import org.example.hotelbooking.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    
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

    
    boolean existsByReservation_ReservationId(Long reservationId);

    
    void deleteByAccommodation_ContentId(String contentId);
}