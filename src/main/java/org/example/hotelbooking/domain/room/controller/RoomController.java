package org.example.hotelbooking.domain.room.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.room.dto.AvailableRoomResponse;
import org.example.hotelbooking.domain.room.service.RoomService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accommodations")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    // 💡 GET /api/v1/accommodations/{contentId}/rooms/available?date=2026-10-05
    @GetMapping("/{contentId}/rooms/available")
    public ResponseEntity<List<AvailableRoomResponse>> getAvailableRooms(
            @PathVariable Long contentId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {

        List<AvailableRoomResponse> response = roomService.getAvailableRooms(contentId, date);
        return ResponseEntity.ok(response);
    }
}