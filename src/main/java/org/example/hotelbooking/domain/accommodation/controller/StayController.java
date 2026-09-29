package org.example.hotelbooking.domain.accommodation.controller;


import org.example.hotelbooking.domain.accommodation.dto.StayResponseDto;
import org.example.hotelbooking.domain.accommodation.service.StayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StayController {

    private final StayService stayService;

    @GetMapping("/stays")
    public ResponseEntity<List<StayResponseDto>> getStays(
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "query", required = false) String query
    ) {
        List<StayResponseDto> list = stayService.getStays(region, type, query);
        return ResponseEntity.ok(list);
    }
}
