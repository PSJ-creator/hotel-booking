package org.example.hotelbooking.domain.review.entity;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.reservation.entity.Reservation;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "REVIEW")
public class Review {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REVIEW_ID")
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONTENT_ID", nullable = false)
    private Accommodation accommodation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RESERVATION_ID", nullable = false, unique = true)
    private Reservation reservation;

    @Column(nullable = false)
    private Integer rating;

    @Lob
    @Column(nullable = false)
    private String content;

    @Lob
    @Column(name = "HOST_REPLY")
    private String hostReply;

    @Column(name = "REPLIED_AT")
    private LocalDateTime repliedAt;

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 숙소 관리자 답글 등록/수정
    public void updateReply(String reply) {
        this.hostReply = reply;
        this.repliedAt = LocalDateTime.now();
    }

    // 숙소 관리자 답글 삭제
    public void deleteReply() {
        this.hostReply = null;
        this.repliedAt = null;
    }
}