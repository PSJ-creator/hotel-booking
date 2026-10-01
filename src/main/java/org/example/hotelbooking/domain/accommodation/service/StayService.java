package org.example.hotelbooking.domain.accommodation.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.StayDetailResponseDto;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.room.entity.Room;
import org.example.hotelbooking.domain.room.entity.RoomImage;
import org.example.hotelbooking.domain.room.repository.RoomImageRepository;
import org.example.hotelbooking.domain.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StayService {

    private final AccommodationRepository accommodationRepository;
    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;

    // 💡 [신규 교체]: checkIn, checkOut 수신 및 박수 계산 후 Repository 전달
    public List<StayResponseDto> getStays(String region, String type, String query, java.time.LocalDate checkIn, java.time.LocalDate checkOut, Integer guests) {
        Long stayDays = 0L;
        if (checkIn != null && checkOut != null && checkOut.isAfter(checkIn)) {
            stayDays = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        } else {
            checkIn = null;
            checkOut = null;
        }

        return accommodationRepository.searchStays(region, type, query, checkIn, checkOut, stayDays, guests);
    }

    public StayDetailResponseDto getStayDetail(String contentId) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다. contentId=" + contentId));

        List<Room> rooms = roomRepository.findByAccommodation_ContentId(contentId);

        Map<Long, List<RoomImage>> roomImagesMap = new HashMap<>();
        for (Room room : rooms) {
            List<RoomImage> images = roomImageRepository.findByRoom_RoomIdOrderByDisplayOrderAsc(room.getRoomId());
            for (RoomImage img : images) {
            }
            roomImagesMap.put(room.getRoomId(), images);
        }

        return StayDetailResponseDto.of(accommodation, rooms, roomImagesMap);
    }
}