package org.example.hotelbooking.domain.accommodation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminRejectRequest {
    private String rejectReason;
}