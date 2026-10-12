package org.example.hotelbooking.domain.member.controller; 

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.dto.AuthDto;
import org.example.hotelbooking.domain.member.dto.MemberDto;
import org.example.hotelbooking.domain.member.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    
    @PostMapping("/password/code")
    public ResponseEntity<String> sendResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        memberService.sendPasswordResetCode(email);

        return ResponseEntity.ok("이메일로 인증 코드가 발송되었습니다.");
    }
    
    @PostMapping("/password/verify")
    public ResponseEntity<String> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        memberService.verifyResetCode(email, code);

        return ResponseEntity.ok("이메일 인증이 완료되었습니다. 비밀번호 변경 화면으로 이동합니다.");
    }

    
    @PostMapping("/password/reset")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        memberService.resetPassword(email, newPassword);

        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }

    
    @GetMapping("/me")
    public ResponseEntity<MemberDto.Response> getMyProfile(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(memberService.getMyProfile(email));
    }

    
    @PutMapping("/me")
    public ResponseEntity<AuthDto.TokenResponse> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody MemberDto.UpdateRequest request
    ) {
        String newToken = memberService.updateProfile(email, request);
        return ResponseEntity.ok(new AuthDto.TokenResponse(newToken));
    }

    
    @PatchMapping("/me/downgrade-host")
    public ResponseEntity<?> downgradeHost(@AuthenticationPrincipal String email) {
        try {
            String newToken = memberService.downgradeHost(email);
            return ResponseEntity.ok(new AuthDto.TokenResponse(newToken));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    
    @DeleteMapping("/me")
    public ResponseEntity<?> withdrawMember(@AuthenticationPrincipal String email) {
        try {
            memberService.withdrawMember(email);
            return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}