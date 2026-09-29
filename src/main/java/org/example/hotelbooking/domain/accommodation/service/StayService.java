package org.example.hotelbooking.domain.accommodation.service;

import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StayService {

    private final AccommodationRepository accommodationRepository;

    public List<StayResponseDto> getStays(String region, String type, String query) {
        return accommodationRepository.searchStays(region, type, query);
    }
}