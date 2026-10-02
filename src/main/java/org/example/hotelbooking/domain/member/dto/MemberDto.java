package org.example.hotelbooking.domain.member.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class MemberDto {

    // 💡 내 정보 조회 응답 DTO
    @Getter
    @Builder
    public static class Response {
        private String email;
        private String name;
        private String role;
        private String businessNo;
        private boolean isSocial; // 카카오 계정 여부
    }

    // 💡 회원정보 수정 요청 DTO
    @Getter
    @NoArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String currentPassword;
        private String newPassword;
    }
}