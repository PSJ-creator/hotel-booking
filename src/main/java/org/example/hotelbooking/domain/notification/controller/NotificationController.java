package org.example.hotelbooking.domain.notification.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.notification.dto.NotificationDto;
import org.example.hotelbooking.domain.notification.service.NotificationQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationQueryService notificationQueryService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal String email) {
        if (email == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationQueryService.getNotifications(email));
    }
}