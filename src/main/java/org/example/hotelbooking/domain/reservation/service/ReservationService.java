package org.example.hotelbooking.domain.reservation.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
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

    @Transactional
    public void createReservation(Long memberId, Long roomId, LocalDate checkIn, LocalDate checkOut, Integer totalPrice) {
        // 1. 체크인 ~ 체크아웃 전날(-1일)까지의 재고 조회
        List<RoomInventory> inventories = roomInventoryRepository
                .findInventoriesForReservation(roomId, checkIn, checkOut.minusDays(1));

        // 2. 요청한 숙박 일수와 DB에 세팅된 재고 일수가 일치하는지 검증
        long days = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        if (inventories.size() != days) {
            throw new IllegalArgumentException("예약할 수 없는 날짜가 포함되어 있습니다.");
        }

        // 3. 재고 차감 (Dirty Checking으로 자동 UPDATE 쿼리 발생)
        for (RoomInventory inventory : inventories) {
            inventory.decreaseCount(1);
        }

        // 4. 예약 정보 저장
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

        reservationRepository.save(reservation);
    }
    // 기존 createReservation 아래에 추가
    @Transactional
    public void cancelReservation(Long reservationId, Long memberId) {
        // 1. 예약 정보 조회
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        // 2. 본인의 예약인지 검증
        if (!reservation.getMember().getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("본인의 예약만 취소할 수 있습니다.");
        }

        // 3. 예약 상태 취소로 변경 (Dirty Checking)
        reservation.cancel();

        // 4. 재고 복구
        List<RoomInventory> inventories = roomInventoryRepository.findInventoriesForReservation(
                reservation.getRoom().getRoomId(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate().minusDays(1)
        );

        for (RoomInventory inventory : inventories) {
            inventory.increaseCount(1);
        }
    }

    // 내 예약 목록 조회
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
}