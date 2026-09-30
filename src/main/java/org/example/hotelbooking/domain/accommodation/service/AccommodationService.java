package org.example.hotelbooking.domain.accommodation.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationDto;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationResponse;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 전체는 읽기 전용으로 성능 최적화
public class AccommodationService {

    private final AccommodationRepository accommodationRepository;
    private final MemberRepository memberRepository; // 💡 호스트 정보를 찾기 위해 추가!

    // 기존에 만드신 지도 조회 기능 (유지)
    public List<AccommodationResponse> getAccommodationsInMap(String minX, String maxX, String minY, String maxY) {
        return accommodationRepository.findAccommodationsInMap(minX, maxX, minY, maxY)
                .stream()
                .map(AccommodationResponse::from)
                .collect(Collectors.toList());
    }

    // 💡 새롭게 추가하는 숙소 등록 기능
    @Transactional // 쓰기(Save) 작업이므로 이 메서드만 readOnly 옵션을 해제합니다.
    public String register(String email, AccommodationDto.RegisterRequest request) {

        Member host = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        String contentId = request.getContentId();
        if (contentId == null || contentId.isBlank()) {
            // 💡 오라클 시퀀스에서 다음 번호(1, 2, 3...)를 가져옵니다.
            Long seqNumber = accommodationRepository.getNextHostAccomSeq();
            // 1부터 들어가기
            contentId = String.valueOf(seqNumber);
        }

        Accommodation accommodation = Accommodation.builder()
                .contentId(contentId)
                .title(request.getTitle())
                .lodgingType(request.getLodgingType())
                .tel(request.getTel())
                .zipcode(request.getZipcode())
                .addr(request.getAddr())
                .checkinTime(request.getCheckinTime())
                .checkoutTime(request.getCheckoutTime())
                .roomCount(request.getRoomCount())
                .roomType(request.getRoomType())
                .parking(request.getParking())
                .subFacility(request.getSubFacility())
                .overview(request.getOverview())
                .host(host) // JWT 토큰에서 꺼낸 유저를 숙소 주인으로 등록
                .approvalStatus(AccommodationStatus.PENDING)
                .build();

        accommodationRepository.save(accommodation);

        return accommodation.getContentId();
    }

    // 💡호스트 이메일로 내 숙소 목록 가져오기
    public List<AccommodationResponse> getMyAccommodations(String email) {
        return accommodationRepository.findByHost_Email(email)
                .stream()
                .map(AccommodationResponse::from)
                .collect(Collectors.toList());
    }
}