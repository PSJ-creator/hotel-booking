package org.example.hotelbooking.domain.room.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.room.dto.AvailableRoomResponse;
import org.example.hotelbooking.domain.room.dto.RoomManageDto;
import org.example.hotelbooking.domain.room.entity.Room;
import org.example.hotelbooking.domain.room.entity.RoomImage;
import org.example.hotelbooking.domain.room.entity.RoomInventory;
import org.example.hotelbooking.domain.room.repository.RoomImageRepository;
import org.example.hotelbooking.domain.room.repository.RoomInventoryRepository;
import org.example.hotelbooking.domain.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final RoomInventoryRepository roomInventoryRepository;
    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final AccommodationRepository accommodationRepository;

    public List<AvailableRoomResponse> getAvailableRooms(Long contentId, LocalDate date) {
        return roomInventoryRepository.findAvailableRooms(contentId, date)
                .stream()
                .map(AvailableRoomResponse::from)
                .collect(Collectors.toList());
    }

    // 💡 1. 특정 숙소의 객실 목록 조회 (호스트 관리 화면용)
    public List<RoomManageDto.Response> getRoomsByAccommodation(String contentId) {
        List<Room> rooms = roomRepository.findByAccommodation_ContentId(contentId);
        return rooms.stream().map(room -> {
            List<String> urls = roomImageRepository
                    .findByRoom_RoomIdOrderByDisplayOrderAsc(room.getRoomId())
                    .stream()
                    .map(RoomImage::getImageUrl)
                    .toList();
            return RoomManageDto.Response.of(room, urls);
        }).toList();
    }

    // 💡 2. 호스트: 새 객실 추가 (ROOM + ROOM_IMAGE + 향후 90일 ROOM_INVENTORY 자동 생성)
    @Transactional
    public Long createRoom(String email, String contentId, RoomManageDto.SaveRequest request) {
        Accommodation accom = validateHostOwnership(email, contentId);

        Room room = Room.builder()
                .accommodation(accom)
                .roomTitle(request.getRoomTitle())
                .roomSize(request.getRoomSize())
                .roomBaseCount(request.getRoomBaseCount())
                .roomMaxCount(request.getRoomMaxCount())
                .pricePerNight(request.getPricePerNight())
                .build();

        Room savedRoom = roomRepository.save(room);

        // 객실 이미지 저장
        saveRoomImages(savedRoom, request.getImageUrls());

        // 오늘부터 90일 치 기본 객실 재고(ROOM_INVENTORY) 자동 세팅
        int stock = (request.getInitialStock() != null && request.getInitialStock() > 0)
                ? request.getInitialStock()
                : 5;
        LocalDate today = LocalDate.now();
        List<RoomInventory> inventories = new ArrayList<>();
        for (int i = 0; i < 90; i++) {
            inventories.add(RoomInventory.builder()
                    .room(savedRoom)
                    .inventoryDate(today.plusDays(i))
                    .availableCount(stock)
                    .build());
        }
        roomInventoryRepository.saveAll(inventories);

        return savedRoom.getRoomId();
    }

    // 💡 3. 호스트: 기존 객실 정보 및 가격 수정
    @Transactional
    public void updateRoom(String email, Long roomId, RoomManageDto.SaveRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다. id=" + roomId));

        validateHostOwnership(email, room.getAccommodation().getContentId());

        room.updateRoom(
                request.getRoomTitle(),
                request.getRoomSize(),
                request.getRoomBaseCount(),
                request.getRoomMaxCount(),
                request.getPricePerNight()
        );

        // 이미지 목록이 전달된 경우 기존 이미지 교체
        if (request.getImageUrls() != null) {
            roomImageRepository.deleteByRoom_RoomId(roomId);
            saveRoomImages(room, request.getImageUrls());
        }
    }

    // 💡 4. 호스트: 객실 삭제
    @Transactional
    public void deleteRoom(String email, Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다. id=" + roomId));

        validateHostOwnership(email, room.getAccommodation().getContentId());

        roomImageRepository.deleteByRoom_RoomId(roomId);
        roomInventoryRepository.deleteByRoom_RoomId(roomId);
        roomRepository.delete(room);
    }

    private Accommodation validateHostOwnership(String email, String contentId) {
        Accommodation accom = accommodationRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 숙소입니다."));
        if (accom.getHost() == null || !accom.getHost().getEmail().equals(email)) {
            throw new IllegalArgumentException("본인 소유의 숙소 객실만 관리할 수 있습니다.");
        }
        return accom;
    }

    private void saveRoomImages(Room room, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;
        int order = 1;
        for (String url : imageUrls) {
            if (url != null && !url.isBlank()) {
                roomImageRepository.save(RoomImage.builder()
                        .room(room)
                        .imageUrl(url.trim())
                        .displayOrder(order++)
                        .build());
            }
        }
    }
}