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
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    private final RoomInventoryRepository roomInventoryRepository; // 💡 재고 조회용 주입

    @Cacheable(
            value = "stayListCache",
            key = "{#region, #type, #query, #checkIn, #checkOut, #guests}"
    )
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

    // 💡 [수정] 체크인/체크아웃 날짜를 받아 객실별 잔여 개수 계산
    public StayDetailResponseDto getStayDetail(String contentId, LocalDate checkIn, LocalDate checkOut) {
        Accommodation accommodation = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다. contentId=" + contentId));

        // 날짜가 지정되지 않았으면 기본 오늘 체크인 ~ 내일 체크아웃(1박) 기준
        if (checkIn == null) {
            checkIn = LocalDate.now();
        }
        if (checkOut == null || !checkOut.isAfter(checkIn)) {
            checkOut = checkIn.plusDays(1);
        }

        long stayDays = ChronoUnit.DAYS.between(checkIn, checkOut);

        List<Room> rooms = roomRepository.findByAccommodation_ContentId(contentId);

        // 해당 숙소의 기간 내 모든 재고 조회 후 roomId별로 그룹핑
        List<RoomInventory> inventories = roomInventoryRepository.findByContentIdAndDateRange(contentId, checkIn, checkOut);
        Map<Long, List<RoomInventory>> invByRoomMap = inventories.stream()
                .collect(Collectors.groupingBy(ri -> ri.getRoom().getRoomId()));

        Map<Long, List<RoomImage>> roomImagesMap = new HashMap<>();
        Map<Long, Integer> roomAvailableMap = new HashMap<>();

        for (Room room : rooms) {
            List<RoomImage> images = roomImageRepository.findByRoom_RoomIdOrderByDisplayOrderAsc(room.getRoomId());
            roomImagesMap.put(room.getRoomId(), images);

            List<RoomInventory> roomInvs = invByRoomMap.getOrDefault(room.getRoomId(), List.of());
            // 숙박 일수(stayDays)만큼 모든 날짜에 재고 데이터가 있어야 하며, 그중 최소 재고를 잔여 객실 수로 설정
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