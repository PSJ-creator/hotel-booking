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

    
    private final KakaoAuthService kakaoAuthService;

    
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody AuthDto.SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    
    @PostMapping("/login")
    public ResponseEntity<AuthDto.TokenResponse> login(@RequestBody AuthDto.LoginRequest request) {
        AuthDto.TokenResponse tokenResponse = authService.login(request);
        return ResponseEntity.ok(tokenResponse);
    }
    
    
    @GetMapping("/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code) {
        
        String token = kakaoAuthService.kakaoLogin(code);

        
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://localhost:5173/oauth/callback?token=" + token));

        return new ResponseEntity<>(headers, HttpStatus.FOUND); 
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