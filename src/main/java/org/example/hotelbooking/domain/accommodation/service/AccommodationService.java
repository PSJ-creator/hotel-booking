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

    
    public List<AccommodationResponse> getAccommodationsInMap(String minX, String maxX, String minY, String maxY) {
        return accommodationRepository.findAccommodationsInMap(minX, maxX, minY, maxY)
                .stream()
                .map(AccommodationResponse::from)
                .collect(Collectors.toList());
    }

    
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

    
    public List<AccommodationDto.HostDetailResponse> getMyAccommodations(String email) {
        return accommodationRepository.findByHost_Email(email)
                .stream()
                .map(AccommodationDto.HostDetailResponse::from)
                .collect(Collectors.toList());
    }

    
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

    
    @Transactional
    public void deleteMyAccommodation(String email, String contentId) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 숙소입니다. id=" + contentId));

        if (accommodation.getHost() == null || !accommodation.getHost().getEmail().equals(email)) {
            throw new IllegalArgumentException("본인이 등록한 숙소만 삭제할 수 있습니다.");
        }

        Long hostMemberId = accommodation.getHost().getMemberId();
        LocalDate today = LocalDate.now();

        
        List<Reservation> targetReservations = reservationRepository.findReservationsByHostId(hostMemberId)
                .stream()
                .filter(r -> contentId.equals(r.getRoom().getAccommodation().getContentId()))
                .toList();

        
        boolean hasActiveReservation = targetReservations.stream()
                .anyMatch(r -> !"CANCELED".equals(r.getStatus()) && r.getCheckOutDate().isAfter(today));

        if (hasActiveReservation) {
            throw new IllegalStateException("해당 숙소에 진행 중이거나 예정된 예약이 존재하여 삭제할 수 없습니다.");
        }

        
        
        reviewRepository.deleteByAccommodation_ContentId(contentId);
        accomLikeRepository.deleteByAccommodation_ContentId(contentId);

        
        if (!targetReservations.isEmpty()) {
            reservationRepository.deleteAll(targetReservations);
        }

        
        List<Room> rooms = roomRepository.findByAccommodation_ContentId(contentId);
        for (Room room : rooms) {
            roomImageRepository.deleteByRoom_RoomId(room.getRoomId());
            roomInventoryRepository.deleteByRoom_RoomId(room.getRoomId());
        }
        if (!rooms.isEmpty()) {
            roomRepository.deleteAll(rooms);
        }

        
        accommodationRepository.delete(accommodation);
    }

    
    public boolean hasApprovedAccommodation(String email) {
        Member host = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        return accommodationRepository.existsByHost_MemberIdAndApprovalStatus(host.getMemberId(), AccommodationStatus.APPROVED);
    }

    
    public List<AccommodationDto.HostDetailResponse> getPendingAccommodations() {
        return accommodationRepository.findByApprovalStatusOrderByCreatedAtDesc(AccommodationStatus.PENDING)
                .stream()
                .map(AccommodationDto.HostDetailResponse::from)
                .collect(Collectors.toList());
    }

    
    @Transactional
    public void approveAccommodation(String contentId) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 숙소입니다. id=" + contentId));
        accommodation.approve();
    }

    
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