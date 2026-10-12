package org.example.hotelbooking.domain.accommodation.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.dto.StayDetailResponseDto;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.room.entity.Room;
import org.example.hotelbooking.domain.room.entity.RoomImage;
import org.example.hotelbooking.domain.room.entity.RoomInventory;
import org.example.hotelbooking.domain.room.repository.RoomImageRepository;
import org.example.hotelbooking.domain.room.repository.RoomInventoryRepository;
import org.example.hotelbooking.domain.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StayService {

    private final AccommodationRepository accommodationRepository;
    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomInventoryRepository roomInventoryRepository; 

    public List<StayResponseDto> getStays(String region, String type, String query, LocalDate checkIn, LocalDate checkOut, Integer guests) {
        Long stayDays = 0L;

        if (checkIn != null && checkOut != null && checkOut.isAfter(checkIn)) {
            stayDays = ChronoUnit.DAYS.between(checkIn, checkOut);
        } else {
            checkIn = LocalDate.now();
            checkOut = LocalDate.now();
        }

        return accommodationRepository.searchStays(region, type, query, checkIn, checkOut, stayDays, guests);
    }

    
    public StayDetailResponseDto getStayDetail(String contentId, LocalDate checkIn, LocalDate checkOut) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다. contentId=" + contentId));

        
        if (checkIn == null) {
            checkIn = LocalDate.now();
        }
        if (checkOut == null || !checkOut.isAfter(checkIn)) {
            checkOut = checkIn.plusDays(1);
        }

        long stayDays = ChronoUnit.DAYS.between(checkIn, checkOut);

        List<Room> rooms = roomRepository.findByAccommodation_ContentId(contentId);

        
        List<RoomInventory> inventories = roomInventoryRepository.findByContentIdAndDateRange(contentId, checkIn, checkOut);
        Map<Long, List<RoomInventory>> invByRoomMap = inventories.stream()
                .collect(Collectors.groupingBy(ri -> ri.getRoom().getRoomId()));

        Map<Long, List<RoomImage>> roomImagesMap = new HashMap<>();
        Map<Long, Integer> roomAvailableMap = new HashMap<>();

        for (Room room : rooms) {
            List<RoomImage> images = roomImageRepository.findByRoom_RoomIdOrderByDisplayOrderAsc(room.getRoomId());
            roomImagesMap.put(room.getRoomId(), images);

            List<RoomInventory> roomInvs = invByRoomMap.getOrDefault(room.getRoomId(), List.of());
            
            if (roomInvs.size() < stayDays) {
                roomAvailableMap.put(room.getRoomId(), 0);
            } else {
                int minAvailable = roomInvs.stream()
                        .mapToInt(RoomInventory::getAvailableCount)
                        .min()
                        .orElse(0);
                roomAvailableMap.put(room.getRoomId(), Math.max(minAvailable, 0));
            }
        }

        return StayDetailResponseDto.of(accommodation, rooms, roomImagesMap, roomAvailableMap);
    }
}