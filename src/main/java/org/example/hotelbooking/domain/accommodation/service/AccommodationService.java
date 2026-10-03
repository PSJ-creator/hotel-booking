package org.example.hotelbooking.domain.accommodation.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationDto;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationResponse;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.like.repository.AccomLikeRepository;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.example.hotelbooking.domain.reservation.repository.ReservationRepository;
import org.example.hotelbooking.domain.review.repository.ReviewRepository;
import org.example.hotelbooking.domain.room.entity.Room;
import org.example.hotelbooking.domain.room.repository.RoomImageRepository;
import org.example.hotelbooking.domain.room.repository.RoomInventoryRepository;
import org.example.hotelbooking.domain.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccommodationService {

    private final AccommodationRepository accommodationRepository;
    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomInventoryRepository roomInventoryRepository;
    private final AccomLikeRepository accomLikeRepository;
    private final ReviewRepository reviewRepository;

    // 지도 기반 숙소 조회
    public List<AccommodationResponse> getAccommodationsInMap(String minX, String maxX, String minY, String maxY) {
        return accommodationRepository.findAccommodationsInMap(minX, maxX, minY, maxY)
                .stream()
                .map(AccommodationResponse::from)
                .collect(Collectors.toList());
    }

    // 💡 1. 숙소 신규 등록 (이미지 및 좌표 컬럼까지 모두 저장)
    @Transactional
    public String register(String email, AccommodationDto.RegisterRequest request) {
        Member host = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        String contentId = request.getContentId();
        if (contentId == null || contentId.isBlank()) {
            Long seqNumber = accommodationRepository.getNextHostAccomSeq();
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
                .firstImage(request.getFirstImage())
                .firstImage2(request.getFirstImage2())
                .mapX(request.getMapX())
                .mapY(request.getMapY())
                .host(host)
                .approvalStatus(AccommodationStatus.PENDING)
                .build();

        accommodationRepository.save(accommodation);
        return accommodation.getContentId();
    }

    // 💡 2. 호스트 내 숙소 전체 컬럼 조회 (수정 폼 바인딩용)
    public List<AccommodationDto.HostDetailResponse> getMyAccommodations(String email) {
        return accommodationRepository.findByHost_Email(email)
                .stream()
                .map(AccommodationDto.HostDetailResponse::from)
                .collect(Collectors.toList());
    }

    // 💡 3. 호스트 내 숙소 정보 수정 (Dirty Checking으로 DB 업데이트)
    @Transactional
    public void updateMyAccommodation(String email, String contentId, AccommodationDto.UpdateRequest request) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 숙소입니다. id=" + contentId));

        if (accommodation.getHost() == null || !accommodation.getHost().getEmail().equals(email)) {
            throw new IllegalArgumentException("본인이 등록한 숙소만 수정할 수 있습니다.");
        }

        accommodation.updateDetails(
                request.getTitle(),
                request.getLodgingType(),
                request.getTel(),
                request.getZipcode(),
                request.getAddr(),
                request.getCheckinTime(),
                request.getCheckoutTime(),
                request.getRoomCount(),
                request.getRoomType(),
                request.getParking(),
                request.getSubFacility(),
                request.getOverview(),
                request.getFirstImage(),
                request.getFirstImage2(),
                request.getMapX(),
                request.getMapY()
        );
    }

    // 💡 4. [신규 추가] 호스트 내 숙소 삭제 (진행 예정인 예약이 없을 때만 허용)
    @Transactional
    public void deleteMyAccommodation(String email, String contentId) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 숙소입니다. id=" + contentId));

        if (accommodation.getHost() == null || !accommodation.getHost().getEmail().equals(email)) {
            throw new IllegalArgumentException("본인이 등록한 숙소만 삭제할 수 있습니다.");
        }

        Long hostMemberId = accommodation.getHost().getMemberId();
        LocalDate today = LocalDate.now();

        // 해당 숙소에 속한 모든 예약 조회
        List<Reservation> targetReservations = reservationRepository.findReservationsByHostId(hostMemberId)
                .stream()
                .filter(r -> contentId.equals(r.getRoom().getAccommodation().getContentId()))
                .toList();

        // 투숙 예정이거나 현재 투숙 중인(취소되지 않은) 예약이 있는지 확인
        boolean hasActiveReservation = targetReservations.stream()
                .anyMatch(r -> !"CANCELED".equals(r.getStatus()) && r.getCheckOutDate().isAfter(today));

        if (hasActiveReservation) {
            throw new IllegalStateException("해당 숙소에 진행 중이거나 예정된 예약이 존재하여 삭제할 수 없습니다.");
        }

        // 외래키(FK) 제약조건 충돌 방지를 위해 자식 레코드부터 순서대로 삭제
        // 1) 리뷰 및 찜(위시리스트) 삭제
        reviewRepository.deleteByAccommodation_ContentId(contentId);
        accomLikeRepository.deleteByAccommodation_ContentId(contentId);

        // 2) 과거 완료/취소된 예약 내역 삭제
        if (!targetReservations.isEmpty()) {
            reservationRepository.deleteAll(targetReservations);
        }

        // 3) 숙소에 속한 객실(ROOM)의 이미지·재고·객실 삭제
        List<Room> rooms = roomRepository.findByAccommodation_ContentId(contentId);
        for (Room room : rooms) {
            roomImageRepository.deleteByRoom_RoomId(room.getRoomId());
            roomInventoryRepository.deleteByRoom_RoomId(room.getRoomId());
        }
        if (!rooms.isEmpty()) {
            roomRepository.deleteAll(rooms);
        }

        // 4) 최종적으로 숙소(ACCOMMODATION) 삭제
        accommodationRepository.delete(accommodation);
    }

    // 호스트의 숙소 보유 여부 확인 (PENDING / APPROVED 등 등록된 숙소가 1개라도 있는지 여부 또는 승인 숙소 여부)
    public boolean hasApprovedAccommodation(String email) {
        Member host = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        return accommodationRepository.existsByHost_MemberIdAndApprovalStatus(host.getMemberId(), AccommodationStatus.APPROVED);
    }

    // 💡 [총괄관리자용] 승인 대기(PENDING) 숙소 목록 최신순 상세 조회
    public List<AccommodationDto.HostDetailResponse> getPendingAccommodations() {
        return accommodationRepository.findByApprovalStatusOrderByCreatedAtDesc(AccommodationStatus.PENDING)
                .stream()
                .map(AccommodationDto.HostDetailResponse::from)
                .collect(Collectors.toList());
    }

    // [총괄관리자용] 숙소 승인 처리
    @Transactional
    public void approveAccommodation(String contentId) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 숙소입니다. id=" + contentId));
        accommodation.approve();
    }

    // [총괄관리자용] 숙소 반려 처리
    @Transactional
    public void rejectAccommodation(String contentId, String rejectReason) {
        if (rejectReason == null || rejectReason.isBlank()) {
            throw new IllegalArgumentException("반려 사유를 입력해야 합니다.");
        }
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 숙소입니다. id=" + contentId));
        accommodation.reject(rejectReason);
    }
}