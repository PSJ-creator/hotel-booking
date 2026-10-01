package org.example.hotelbooking.domain.room.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.room.repository.RoomInventoryRepository;
import org.example.hotelbooking.domain.room.dto.AvailableRoomResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomInventoryRepository roomInventoryRepository;

    @Transactional(readOnly = true) // 💡 조회 전용이므로 readOnly=true를 주면 성능이 향상됩니다.
    public List<AvailableRoomResponse> getAvailableRooms(Long contentId, LocalDate date) {

        return roomInventoryRepository.findAvailableRooms(contentId, date)
                .stream()
                .map(AvailableRoomResponse::from) // DTO로 변환
                .collect(Collectors.toList());
    }
}