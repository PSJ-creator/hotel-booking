package org.example.hotelbooking.domain.accommodation.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.AccommodationResponse;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 조회 성능 최적화
public class AccommodationService {

    private final AccommodationRepository accommodationRepository;

    public List<AccommodationResponse> getAccommodationsInMap(String minX, String maxX, String minY, String maxY) {
        return accommodationRepository.findAccommodationsInMap(minX, maxX, minY, maxY)
                .stream()
                .map(AccommodationResponse::from) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }
}