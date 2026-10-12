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
        
        int threadCount = 100;
        
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        
        CountDownLatch latch = new CountDownLatch(threadCount);

        
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failCount = new AtomicInteger();

        
        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    
                    reservationLockFacade.reserveRoomWithLock(
                            1L, 1045L, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 2), 150000
                    );
                    successCount.incrementAndGet(); 
                } catch (Exception e) {
                    failCount.incrementAndGet(); 
                } finally {
                    latch.countDown(); 
                }
            });
        }

        latch.await(); 

        
        System.out.println("✅ 성공한 예약 횟수: " + successCount.get());
        System.out.println("❌ 실패한 예약 횟수: " + failCount.get());

        
        assertThat(successCount.get()).isEqualTo(5);
        
        assertThat(failCount.get()).isEqualTo(95);
    }
}