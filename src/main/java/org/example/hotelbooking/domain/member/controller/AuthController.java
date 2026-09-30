package org.example.hotelbooking.domain.member.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.dto.AuthDto;
import org.example.hotelbooking.domain.member.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.example.hotelbooking.domain.member.service.KakaoAuthService;

import java.net.URI;

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
    // 카카오 로그인 간 json만 띄워서 기존 AuthController 내부의 kakaoCallback 메서드 교체
    @GetMapping("/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code) {
        // 1. 카카오 로그인 후 JWT 토큰 발급
        String token = kakaoAuthService.kakaoLogin(code);

        // 2. 리액트 프론트엔드로 토큰을 쿼리 스트링에 담아 리다이렉트
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://localhost:5173/oauth/callback?token=" + token));

        return new ResponseEntity<>(headers, HttpStatus.FOUND); // 302 리다이렉트
    }

    @PostMapping("/apply-host")
    public ResponseEntity<AuthDto.TokenResponse> applyHost(
            @RequestBody AuthDto.HostApplyRequest request,
            @AuthenticationPrincipal String email
    ) {
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String newToken = authService.upgradeToHost(email, request.getBusinessNo());
        return ResponseEntity.ok(new AuthDto.TokenResponse(newToken));
    }
}