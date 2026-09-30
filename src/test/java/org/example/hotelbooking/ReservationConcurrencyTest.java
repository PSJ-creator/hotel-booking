package org.example.hotelbooking;

import org.example.hotelbooking.domain.reservation.facade.ReservationLockFacade;
import org.example.hotelbooking.domain.room.repository.RoomInventoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ReservationConcurrencyTest {

    @Autowired
    private ReservationLockFacade reservationLockFacade;

    @Autowired
    private RoomInventoryRepository roomInventoryRepository;

    @Test
    @DisplayName("100명이 동시에 예약을 요청하면 재고(5개)만큼만 성공하고 나머지는 실패해야 한다")
    void reserve_concurrency_test() throws InterruptedException {
        // given
        int threadCount = 100;
        // 멀티스레드 환경 구축 (32개의 스레드가 동시에 일하도록 세팅)
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        // 100개의 요청이 모두 끝날 때까지 메인 스레드를 기다리게 하는 장치
        CountDownLatch latch = new CountDownLatch(threadCount);

        // 성공과 실패 횟수를 안전하게 카운트할 객체
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failCount = new AtomicInteger();

        // when (100번 동시 요청 발사!)
        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    // 아까 Postman으로 날렸던 그 데이터 그대로 요청
                    reservationLockFacade.reserveRoomWithLock(
                            1L, 1045L, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 2), 150000
                    );
                    successCount.incrementAndGet(); // 성공 시 +1
                } catch (Exception e) {
                    failCount.incrementAndGet(); // 실패 시 +1 (재고 부족 또는 락 획득 실패 등)
                } finally {
                    latch.countDown(); // 스레드 작업이 끝나면 카운트 다운
                }
            });
        }

        latch.await(); // 100개의 요청이 다 끝날 때까지 대기

        // then (결과 확인)
        System.out.println("✅ 성공한 예약 횟수: " + successCount.get());
        System.out.println("❌ 실패한 예약 횟수: " + failCount.get());

        // 재고가 5개였으므로 정확히 5번만 성공해야 한다.
        assertThat(successCount.get()).isEqualTo(5);
        // 나머지는 95번은 실패해야 한다.
        assertThat(failCount.get()).isEqualTo(95);
    }
}