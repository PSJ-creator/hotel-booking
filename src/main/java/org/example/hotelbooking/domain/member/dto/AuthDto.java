package org.example.hotelbooking.domain.member.dto;

import lombok.Getter;

public class AuthDto {

    @Getter
    public static class SignupRequest {
        private String email;
        private String password;
        private String name;
        private String businessNo; // 사업자번호 (일반 유저는 null)
    }

    @Getter
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    public static class TokenResponse {
        private String token; // Access Token
        private String refreshToken;

        public TokenResponse(String token, String refreshToken) {
            this.token = token;
            this.refreshToken = refreshToken;
        }
    }

    // 기존 유저 숙소관리자 신청을 위한 사업자번호 get 추가
    @Getter
    public static class HostApplyRequest {
        private String businessNo;
    }
}