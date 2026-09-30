package org.example.hotelbooking.domain.reservation.facade;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelbooking.domain.reservation.repository.ReservationRepository;
import org.example.hotelbooking.domain.reservation.service.ReservationService;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationLockFacade {

    private final RedissonClient redissonClient;
    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;

    public void reserveRoomWithLock(Long memberId, Long roomId, LocalDate checkIn, LocalDate checkOut, Integer totalPrice) {
        // 객실 고유 ID를 기반으로 락 키 생성 (해당 객실에 대해서만 줄을 세움)
        String lockKey = "room_lock:" + roomId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 락 획득 시도: 최대 5초 대기, 락 획득 후 3초간 유지
            boolean isLocked = lock.tryLock(5, 3, TimeUnit.SECONDS);

            if (!isLocked) {
                log.warn("락 획득 실패 - roomId: {}", roomId);
                throw new RuntimeException("현재 예약자가 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
            }

            // 💡 락 획득 성공 시, 안전하게 트랜잭션(예약 및 재고 차감) 실행
            reservationService.createReservation(memberId, roomId, checkIn, checkOut, totalPrice);

        } catch (InterruptedException e) {
            log.error("예약 락 대기 중 인터럽트 발생", e);
            throw new RuntimeException("예약 처리 중 시스템 오류가 발생했습니다.");
        } finally {
            // 로직이 끝나면 반드시 락 반납
            if (lock.isLocked() && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
    public void cancelReservationWithLock(Long reservationId, Long memberId) {
        // 락을 걸 roomId를 알아내기 위해 예약 정보 먼저 조회
        org.example.hotelbooking.domain.reservation.entity.Reservation reservation =
                reservationRepository.findById(reservationId)
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        Long roomId = reservation.getRoom().getRoomId();
        String lockKey = "room_lock:" + roomId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            boolean isLocked = lock.tryLock(5, 3, TimeUnit.SECONDS);
            if (!isLocked) {
                log.warn("취소 락 획득 실패 - reservationId: {}", reservationId);
                throw new RuntimeException("현재 처리량이 많아 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
            }

            // 💡 락 획득 성공 시, 안전하게 취소 및 재고 복구 트랜잭션 실행
            reservationService.cancelReservation(reservationId, memberId);

        } catch (InterruptedException e) {
            log.error("취소 락 대기 중 인터럽트 발생", e);
            throw new RuntimeException("취소 처리 중 시스템 오류가 발생했습니다.");
        } finally {
            if (lock.isLocked() && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}