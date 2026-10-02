package org.example.hotelbooking.domain.accommodation.controller;

import org.example.hotelbooking.domain.accommodation.dto.StayDetailResponseDto;
import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.service.StayService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StayController {

    private final StayService stayService;

    @GetMapping("/stays")
    public ResponseEntity<List<StayResponseDto>> getStays(
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "checkIn", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate checkIn,
            @RequestParam(value = "checkOut", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate checkOut,
            @RequestParam(value = "guests", required = false) Integer guests
    ) {
        List<StayResponseDto> list = stayService.getStays(region, type, query, checkIn, checkOut, guests);
        return ResponseEntity.ok(list);
    }

    // 💡 [수정] checkIn, checkOut 파라미터 수신
    @GetMapping("/stays/{contentId}")
    public ResponseEntity<StayDetailResponseDto> getStayDetail(
            @PathVariable String contentId,
            @RequestParam(value = "checkIn", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate checkIn,
            @RequestParam(value = "checkOut", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate checkOut
    ) {
        return ResponseEntity.ok(stayService.getStayDetail(contentId, checkIn, checkOut));
    }
}