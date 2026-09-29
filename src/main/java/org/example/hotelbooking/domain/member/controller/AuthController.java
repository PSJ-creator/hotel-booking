package org.example.hotelbooking.domain.member.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.dto.AuthDto;
import org.example.hotelbooking.domain.member.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.hotelbooking.domain.member.service.KakaoAuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 기존 AuthController 클래스 안에 필드 주입 추가
    private final KakaoAuthService kakaoAuthService;

    // 일반 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody AuthDto.SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 일반 로그인 API
    @PostMapping("/login")
    public ResponseEntity<AuthDto.TokenResponse> login(@RequestBody AuthDto.LoginRequest request) {
        AuthDto.TokenResponse tokenResponse = authService.login(request);
        return ResponseEntity.ok(tokenResponse);
    }
    // 카카오 로그인 시
    @GetMapping("/kakao/callback")
    public ResponseEntity<AuthDto.TokenResponse> kakaoCallback(@RequestParam String code) {
        // 코드를 서비스에 넘겨서 JWT 토큰을 받아옵니다.
        String token = kakaoAuthService.kakaoLogin(code);
        return ResponseEntity.ok(new AuthDto.TokenResponse(token));
    }
}