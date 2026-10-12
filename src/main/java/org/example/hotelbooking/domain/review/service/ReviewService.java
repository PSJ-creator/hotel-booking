package org.example.hotelbooking.domain.review.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.example.hotelbooking.domain.reservation.repository.ReservationRepository;
import org.example.hotelbooking.domain.review.dto.ReviewDto;
import org.example.hotelbooking.domain.review.entity.Review;
import org.example.hotelbooking.domain.review.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;

    
    public List<ReviewDto.Response> getReviewsByStay(String contentId) {
        return reviewRepository.findByAccommodation_ContentIdOrderByCreatedAtDesc(contentId)
                .stream()
                .map(ReviewDto.Response::from)
                .toList();
    }

    
    @Transactional
    public void createReview(String email, ReviewDto.CreateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        if (!reservation.getMember().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("본인이 예약한 내역에만 리뷰를 작성할 수 있습니다.");
        }

        if ("CANCELED".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("취소된 예약에는 리뷰를 작성할 수 없습니다.");
        }

        if (reviewRepository.existsByReservation_ReservationId(reservation.getReservationId())) {
            throw new IllegalStateException("이미 리뷰를 작성한 예약입니다.");
        }

        Accommodation accom = reservation.getRoom().getAccommodation();

        Review review = Review.builder()
                .member(member)
                .accommodation(accom)
                .reservation(reservation)
                .rating(request.getRating() != null ? request.getRating() : 5)
                .content(request.getContent())
                .build();

        reviewRepository.save(review);
    }

    
    public List<ReviewDto.Response> getManageReviews(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String role = member.getRole().getRoleName();
        List<Review> reviews = "ROLE_ADMIN".equals(role)
                ? reviewRepository.findAllWithDetails()
                : reviewRepository.findAllByHostEmail(email);

        return reviews.stream()
                .map(ReviewDto.Response::from)
                .toList();
    }

    
    @Transactional
    public void saveReply(String email, Long reviewId, String replyContent) {
        if (replyContent == null || replyContent.isBlank()) {
            throw new IllegalArgumentException("답글 내용을 입력해 주세요.");
        }

        Review review = getAuthorizedReview(email, reviewId);
        review.updateReply(replyContent.trim());
    }

    
    @Transactional
    public void deleteReply(String email, Long reviewId) {
        Review review = getAuthorizedReview(email, reviewId);
        review.deleteReply();
    }

    private Review getAuthorizedReview(String email, Long reviewId) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));

        boolean isAdmin = "ROLE_ADMIN".equals(member.getRole().getRoleName());
        boolean isHostOwner = review.getAccommodation().getHost() != null
                && email.equals(review.getAccommodation().getHost().getEmail());

        if (!isAdmin && !isHostOwner) {
            throw new IllegalArgumentException("해당 숙소의 관리자만 답글을 관리할 수 있습니다.");
        }
        return review;
    }
}