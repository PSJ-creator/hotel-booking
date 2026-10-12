package org.example.hotelbooking.domain.member.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class MemberDto {

    
    @Getter
    @Builder
    public static class Response {
        private String email;
        private String name;
        private String role;
        private String businessNo;
        private boolean isSocial; 
    }

    
    @Getter
    @NoArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String currentPassword;
        private String newPassword;
    }
}