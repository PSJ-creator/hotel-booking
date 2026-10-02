package org.example.hotelbooking.domain.tour.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.tour.dto.TourDto;
import org.example.hotelbooking.domain.tour.entity.TourAttraction;
import org.example.hotelbooking.domain.tour.entity.TourImage;
import org.example.hotelbooking.domain.tour.entity.TourLike;
import org.example.hotelbooking.domain.tour.repository.TourAttractionRepository;
import org.example.hotelbooking.domain.tour.repository.TourImageRepository;
import org.example.hotelbooking.domain.tour.repository.TourLikeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourService {

    private final TourAttractionRepository tourAttractionRepository;
    private final TourImageRepository tourImageRepository;
    private final TourLikeRepository tourLikeRepository;
    private final MemberRepository memberRepository;

    // 1. 전체 관광지 목록 조회 (지도 표시용)
    public List<TourDto.SummaryResponse> getAllTours() {
        return tourAttractionRepository.findAllByOrderByTitleAsc()
                .stream()
                .map(TourDto.SummaryResponse::from)
                .toList();
    }

    // 2. 관광지 단건 상세 조회
    public TourDto.DetailResponse getTourDetail(String contentId) {
        TourAttraction tour = tourAttractionRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("관광지 정보를 찾을 수 없습니다. contentId=" + contentId));

        List<TourImage> images = tourImageRepository.findByTourAttraction_ContentIdOrderByImageIdAsc(contentId);
        return TourDto.DetailResponse.of(tour, images);
    }

    // 3. 관광지 찜 여부 확인
    public boolean isLiked(String email, String contentId) {
        if (email == null || contentId == null) return false;
        Member member = memberRepository.findByEmail(email).orElse(null);
        if (member == null) return false;
        return tourLikeRepository.existsByMember_MemberIdAndTourAttraction_ContentId(member.getMemberId(), contentId);
    }

    // 4. 관광지 찜 토글
    @Transactional
    public boolean toggleTourLike(String email, String contentId) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        TourAttraction tour = tourAttractionRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("관광지를 찾을 수 없습니다."));

        Optional<TourLike> existing = tourLikeRepository
                .findByMember_MemberIdAndTourAttraction_ContentId(member.getMemberId(), contentId);

        if (existing.isPresent()) {
            tourLikeRepository.delete(existing.get());
            return false;
        } else {
            tourLikeRepository.save(TourLike.builder()
                    .member(member)
                    .tourAttraction(tour)
                    .build());
            return true;
        }
    }

    // 5. 내가 찜한 관광지 목록 조회
    public List<TourDto.SummaryResponse> getMyLikedTours(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return tourLikeRepository.findByMemberIdWithTour(member.getMemberId())
                .stream()
                .map(tl -> TourDto.SummaryResponse.from(tl.getTourAttraction()))
                .toList();
    }
}