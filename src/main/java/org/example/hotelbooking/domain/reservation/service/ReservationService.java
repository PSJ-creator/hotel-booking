package org.example.hotelbooking.domain.reservation.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.member.service.MailService;
import org.example.hotelbooking.domain.reservation.dto.ReservationDto;
import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.example.hotelbooking.domain.reservation.repository.ReservationRepository;
import org.example.hotelbooking.domain.review.repository.ReviewRepository;
import org.example.hotelbooking.domain.room.entity.Room;
import org.example.hotelbooking.domain.room.entity.RoomInventory;
import org.example.hotelbooking.domain.room.repository.RoomInventoryRepository;
import org.example.hotelbooking.domain.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomInventoryRepository roomInventoryRepository;
    private final MemberRepository memberRepository;
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;
    private final MailService mailService;

    @Transactional
    public void createReservation(Long memberId, Long roomId, LocalDate checkIn, LocalDate checkOut, Integer totalPrice) {
        
        List<RoomInventory> inventories = roomInventoryRepository
                .findInventoriesForReservation(roomId, checkIn, checkOut.minusDays(1));

        
        long days = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        if (inventories.size() != days) {
            throw new IllegalArgumentException("예약할 수 없는 날짜가 포함되어 있습니다.");
        }

        
        for (RoomInventory inventory : inventories) {
            inventory.decreaseCount(1);
        }

        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        Reservation reservation = Reservation.builder()
                .member(member)
                .room(room)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .totalPrice(totalPrice)
                .status("COMPLETED")
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        
        Accommodation accom = room.getAccommodation();
        mailService.sendReservationConfirmation(
                member.getEmail(),
                member.getName(),
                savedReservation.getReservationId(),
                accom.getContentId(),
                accom.getTitle(),
                accom.getAddr(),
                accom.getTel(),
                accom.getCheckinTime(),
                accom.getCheckoutTime(),
                room.getRoomTitle(),
                checkIn,
                checkOut,
                totalPrice
        );
    }
    
    @Transactional
    public void cancelReservation(Long reservationId, Long requesterMemberId) {
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        Long guestMemberId = reservation.getMember().getMemberId();
        Member host = reservation.getRoom().getAccommodation().getHost();
        Long hostMemberId = (host != null) ? host.getMemberId() : null;

        boolean isGuest = guestMemberId.equals(requesterMemberId);
        boolean isHostOwner = hostMemberId != null && hostMemberId.equals(requesterMemberId);

        
        if (!isGuest && !isHostOwner) {
            throw new IllegalArgumentException("예약자 본인 또는 해당 숙소의 관리자만 예약을 취소할 수 있습니다.");
        }

        
        reservation.cancel();

        
        List<RoomInventory> inventories = roomInventoryRepository.findInventoriesForReservation(
                reservation.getRoom().getRoomId(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate().minusDays(1)
        );

        for (RoomInventory inventory : inventories) {
            inventory.increaseCount(1);
        }
    }

    
    @Transactional(readOnly = true)
    public List<ReservationDto.MyReservationResponse> getMyReservations(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Reservation> reservations = reservationRepository
                .findByMember_MemberIdOrderByCreatedAtDesc(member.getMemberId());

        return reservations.stream()
                .map(r -> {
                    boolean hasReview = reviewRepository.existsByReservation_ReservationId(r.getReservationId());
                    return ReservationDto.MyReservationResponse.of(r, hasReview);
                })
                .toList();
    }

    
    @Transactional(readOnly = true)
    public List<ReservationDto.HostReservationResponse> getHostReservations(String email) {
        Member host = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Reservation> reservations = reservationRepository
                .findReservationsByHostId(host.getMemberId());

        return reservations.stream()
                .map(ReservationDto.HostReservationResponse::from)
                .toList();
    }
}