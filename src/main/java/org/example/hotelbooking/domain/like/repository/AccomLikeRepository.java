package org.example.hotelbooking.domain.like.repository;

import org.example.hotelbooking.domain.like.entity.AccomLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AccomLikeRepository extends JpaRepository<AccomLike, Long> {
    // 💡 회원이 특정 숙소를 찜했는지 여부 확인 (하트 색칠하기 위함)
    boolean existsByMember_MemberIdAndAccommodation_ContentId(Long memberId, String contentId);

    // 💡 회원이 특정 숙소 찜하기를 취소할 때 해당 데이터 찾기
    Optional<AccomLike> findByMember_MemberIdAndAccommodation_ContentId(Long memberId, String contentId);

    // 💡 마이페이지에서 내가 찜한 숙소 목록 볼 때 사용
    List<AccomLike> findByMember_MemberIdOrderByCreatedAtDesc(Long memberId);
}