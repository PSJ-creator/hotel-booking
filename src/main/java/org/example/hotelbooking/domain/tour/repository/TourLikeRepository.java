package org.example.hotelbooking.domain.tour.repository;

import org.example.hotelbooking.domain.tour.entity.TourLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourLikeRepository extends JpaRepository<TourLike, Long> {
    boolean existsByMember_MemberIdAndTourAttraction_ContentId(Long memberId, String contentId);

    Optional<TourLike> findByMember_MemberIdAndTourAttraction_ContentId(Long memberId, String contentId);

    @Query("SELECT tl FROM TourLike tl JOIN FETCH tl.tourAttraction WHERE tl.member.memberId = :memberId ORDER BY tl.createdAt DESC")
    List<TourLike> findByMemberIdWithTour(@Param("memberId") Long memberId);
}