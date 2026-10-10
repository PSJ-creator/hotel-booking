package org.example.hotelbooking.domain.accommodation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CacheWarmupComponent {

    private final StayService stayService;

    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        System.out.println("🚀 [Cache Warm-up] 서버 시작 시 숙소 데이터를 Redis에 미리 적재");
        // k6 테스트와 완전히 동일한 조건(빈 파라미터)으로 캐시를 강제 생성
        stayService.getStays(null, null, null, null, null, null);
        System.out.println("✅ [Cache Warm-up] 캐시 적재 완료! 이제 k6 부하 테스트 시작 가능.");
    }
}