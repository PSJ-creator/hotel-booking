package org.example.hotelbooking.domain.like.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.like.entity.AccomLike;
import org.example.hotelbooking.domain.like.repository.AccomLikeRepository;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccomLikeService {

    private final AccomLikeRepository accomLikeRepository;
    private final MemberRepository memberRepository;
    private final AccommodationRepository accommodationRepository;

    public boolean isLiked(String email, String contentId) {
        if (email == null || contentId == null) {
            return false;
        }

        Member member = memberRepository.findByEmail(email).orElse(null);
        if (member == null) {
            return false;
        }

        return accomLikeRepository.existsByMember_MemberIdAndAccommodation_ContentId(member.getMemberId(), contentId);
    }

    
    @Transactional
    public boolean toggleLike(String email, String contentId) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

        Optional<AccomLike> existingLike = accomLikeRepository
                .findByMember_MemberIdAndAccommodation_ContentId(member.getMemberId(), contentId);

        if (existingLike.isPresent()) {
            accomLikeRepository.delete(existingLike.get());
            return false; 
        } else {
            AccomLike newLike = AccomLike.builder()
                    .member(member)
                    .accommodation(accommodation)
                    .build();
            accomLikeRepository.save(newLike);
            return true; 
        }
    }

    public List<StayResponseDto> getMyWishlist(String email, LocalDate checkIn, LocalDate checkOut, Integer guests) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Long stayDays = 0L;
        if (checkIn != null && checkOut != null && checkOut.isAfter(checkIn)) {
            stayDays = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        } else {
            checkIn = LocalDate.now();
            checkOut = LocalDate.now();
        }

        return accomLikeRepository.findWishlistStaysByMemberIdAndDates(member.getMemberId(), checkIn, checkOut, stayDays, guests);
    }
}