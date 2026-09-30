package org.example.hotelbooking.domain.notification.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.notification.dto.NotificationDto;
import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.example.hotelbooking.domain.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationQueryService {

    private final MemberRepository memberRepository;
    private final AccommodationRepository accommodationRepository;
    private final ReservationRepository reservationRepository;

    public List<NotificationDto> getNotifications(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<NotificationDto> list = new ArrayList<>();
        String roleName = member.getRole().getRoleName();

        // 1. 숙소 관리자 (ROLE_HOST) 알림
        if ("ROLE_HOST".equals(roleName)) {
            // [알림 1] 숙소 등록 반려 내역
            List<Accommodation> rejectedList = accommodationRepository
                    .findByHost_MemberIdAndApprovalStatus(member.getMemberId(), AccommodationStatus.REJECTED);

            for (Accommodation a : rejectedList) {
                String reason = a.getRejectReason() != null ? a.getRejectReason() : "사유가 입력되지 않았습니다.";
                list.add(NotificationDto.builder()
                        .id("REJECT_" + a.getContentId())
                        .title("숙소 신청이 반려되었습니다.")
                        .message("숙소: " + a.getTitle() + " / 반려 사유 : " + reason)
                        .type("ACCOM_REJECT")
                        .createdAt(a.getCreatedAt())
                        .build());
            }

            // [알림 2] 숙소 예약 신청 알림 (추후 예약 신청 연동용)
            List<Reservation> hostReservations = reservationRepository.findReservationsByHostId(member.getMemberId());
            for (Reservation r : hostReservations) {
                // 최근 예약 알림 (예시: COMPLETED/RESERVED 상태)
                list.add(NotificationDto.builder()
                        .id("RES_" + r.getReservationId())
                        .title("새로운 숙소 예약이 접수되었습니다.")
                        .message("예약자: " + r.getMember().getName() + " (" + r.getCheckInDate() + " ~ " + r.getCheckOutDate() + ")")
                        .type("RESERVATION_NEW")
                        .createdAt(r.getCreatedAt())
                        .build());
            }
        }

        // 2. 총괄 관리자 (ROLE_ADMIN) 알림
        if ("ROLE_ADMIN".equals(roleName)) {
            // [알림 3] 신규 등록되어 심사 대기 중인 숙소 알림
            List<Accommodation> pendingList = accommodationRepository
                    .findByApprovalStatusOrderByCreatedAtDesc(AccommodationStatus.PENDING);

            for (Accommodation a : pendingList) {
                list.add(NotificationDto.builder()
                        .id("PENDING_" + a.getContentId())
                        .title("신규 숙소 승인 요청이 있습니다.")
                        .message("숙소명: " + a.getTitle() + " (호스트: " + a.getHost().getName() + ")")
                        .type("ACCOM_PENDING")
                        .createdAt(a.getCreatedAt())
                        .build());
            }
        }

        // 최신 등록 순 정렬
        list.sort((o1, o2) -> {
            if (o1.getCreatedAt() == null || o2.getCreatedAt() == null) return 0;
            return o2.getCreatedAt().compareTo(o1.getCreatedAt());
        });

        return list;
    }
}