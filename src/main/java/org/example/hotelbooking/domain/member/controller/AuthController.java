package org.example.hotelbooking.domain.member.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.dto.AuthDto;
import org.example.hotelbooking.domain.member.service.AuthService;
import org.example.hotelbooking.domain.member.service.KakaoAuthService;
import org.springframework.beans.factory.annotation.Value; // 💡 이거 꼭 필요합니다!
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final KakaoAuthService kakaoAuthService;

    // 💡 application.properties의 app.domain 값을 가져오되, 없으면 5173 사용
    @Value("${app.domain:http://localhost:5173}")
    private String appDomain;

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

    // 💡 수정한 부분: 하드코딩 대신 appDomain을 사용하여 동적으로 리다이렉트!
    @GetMapping("/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code) {
        String token = kakaoAuthService.kakaoLogin(code);

        HttpHeaders headers = new HttpHeaders();
        // 절대경로 생성: "http://localhost:5173" (로컬) 또는 "http://150.230.7.97" (배포)
        headers.setLocation(URI.create(appDomain + "/oauth/callback?token=" + token));

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