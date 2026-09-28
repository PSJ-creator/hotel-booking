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
        private String token;

        public TokenResponse(String token) {
            this.token = token;
        }
    }
}