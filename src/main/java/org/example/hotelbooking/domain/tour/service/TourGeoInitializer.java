package org.example.hotelbooking.domain.tour.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelbooking.domain.tour.entity.TourAttraction;
import org.example.hotelbooking.domain.tour.repository.TourAttractionRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TourGeoInitializer {

    private final StringRedisTemplate redisTemplate;
    private final TourAttractionRepository tourRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void syncTourCoordinatesToRedis() {
        String key = "tour:geo:locations";

        // 기존에 남아있던 캐시 삭제 (초기화)
        redisTemplate.delete(key);

        List<TourAttraction> tours = tourRepository.findAll();

        for (TourAttraction tour : tours) {
            try {
                // 좌표값이 비어있지 않은 데이터만 Redis에 저장
                if (tour.getMapX() != null && tour.getMapY() != null) {
                    double x = Double.parseDouble(tour.getMapX());
                    double y = Double.parseDouble(tour.getMapY());

                    redisTemplate.opsForGeo().add(key, new Point(x, y), tour.getContentId());
                }
            } catch (NumberFormatException e) {
                log.warn("좌표 변환 실패 - 관광지 ID: {}", tour.getContentId());
            }
        }
        log.info("✅ Redis에 {}개의 관광지 좌표 적재 완료!", tours.size());
    }
}
