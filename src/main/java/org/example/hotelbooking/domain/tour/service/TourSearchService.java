package org.example.hotelbooking.domain.tour.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.tour.dto.NearbyTourResponseDto;
import org.example.hotelbooking.domain.tour.repository.TourAttractionRepository;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.domain.geo.Metrics;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourSearchService {

    private final StringRedisTemplate redisTemplate;
    private final TourAttractionRepository tourRepository;
    private final AccommodationRepository accommodationRepository;

    public List<NearbyTourResponseDto> getNearbyTours(String accomContentId) {
        
        Accommodation accom = accommodationRepository.findById(accomContentId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

        double accomX = Double.parseDouble(accom.getMapX());
        double accomY = Double.parseDouble(accom.getMapY());

        
        String key = "tour:geo:locations";
        Circle circle = new Circle(new Point(accomX, accomY), new Distance(20.0, Metrics.KILOMETERS));

        RedisGeoCommands.GeoRadiusCommandArgs args =
                RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs()
                        .includeDistance()
                        .sortAscending()
                        .limit(9); 

        GeoResults<RedisGeoCommands.GeoLocation<String>> geoResults =
                redisTemplate.opsForGeo().radius(key, circle, args);

        List<NearbyTourResponseDto> resultList = new ArrayList<>();

        if (geoResults != null) {
            for (GeoResult<RedisGeoCommands.GeoLocation<String>> geoResult : geoResults) {
                
                String tourId = geoResult.getContent().getName();
                double distance = geoResult.getDistance().getValue();

                
                tourRepository.findById(tourId).ifPresent(tour -> {
                    double formattedDistance = Math.round(distance * 10) / 10.0;

                    resultList.add(new NearbyTourResponseDto(
                            tour.getContentId(),
                            tour.getTitle(),
                            tour.getFirstImage(),
                            formattedDistance
                    ));
                });
            }
        }
        return resultList;
    }
}