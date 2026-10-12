package org.example.hotelbooking.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationDto {
    private String id;        
    private String title;     
    private String message;   
    private String type;      
    private LocalDateTime createdAt;
}