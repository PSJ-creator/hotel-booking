package org.example.hotelbooking.domain.room.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.room.dto.AvailableRoomResponse;
import org.example.hotelbooking.domain.room.dto.RoomManageDto;
import org.example.hotelbooking.domain.room.service.RoomService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accommodations")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/{contentId}/rooms/available")
    public ResponseEntity<List<AvailableRoomResponse>> getAvailableRooms(
            @PathVariable Long contentId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {

        List<AvailableRoomResponse> response = roomService.getAvailableRooms(contentId, date);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/{contentId}/rooms")
    public ResponseEntity<List<RoomManageDto.Response>> getRoomsByAccommodation(
            @PathVariable String contentId
    ) {
        return ResponseEntity.ok(roomService.getRoomsByAccommodation(contentId));
    }

    
    @PreAuthorize("hasRole('HOST')")
    @PostMapping("/{contentId}/rooms")
    public ResponseEntity<Long> createRoom(
            @PathVariable String contentId,
            @RequestBody RoomManageDto.SaveRequest request,
            @AuthenticationPrincipal String email
    ) {
        Long roomId = roomService.createRoom(email, contentId, request);
        return ResponseEntity.ok(roomId);
    }

    
    @PreAuthorize("hasRole('HOST')")
    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<String> updateRoom(
            @PathVariable Long roomId,
            @RequestBody RoomManageDto.SaveRequest request,
            @AuthenticationPrincipal String email
    ) {
        roomService.updateRoom(email, roomId, request);
        return ResponseEntity.ok("객실 정보가 수정되었습니다.");
    }

    
    @PreAuthorize("hasRole('HOST')")
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<String> deleteRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal String email
    ) {
        roomService.deleteRoom(email, roomId);
        return ResponseEntity.ok("객실이 삭제되었습니다.");
    }
}