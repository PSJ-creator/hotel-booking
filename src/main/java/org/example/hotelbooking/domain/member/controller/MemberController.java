package org.example.hotelbooking.domain.member.controller; // 패키지 경로는 본인 프로젝트에 맞게 수정하세요.

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

    // 💡 1. 이메일 인증 코드 발송 API
    @PostMapping("/password/code")
    public ResponseEntity<String> sendResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        memberService.sendPasswordResetCode(email);

        return ResponseEntity.ok("이메일로 인증 코드가 발송되었습니다.");
    }
    // 💡 2. 인증 코드 검증 API (프론트엔드에서 코드 입력 후 확인 버튼 누를 때)
    @PostMapping("/password/verify")
    public ResponseEntity<String> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        memberService.verifyResetCode(email, code);

        return ResponseEntity.ok("이메일 인증이 완료되었습니다. 비밀번호 변경 화면으로 이동합니다.");
    }

    // 💡 3. 새 비밀번호 재설정 API (프론트엔드에서 새 비밀번호 입력 후 완료 버튼 누를 때)
    @PostMapping("/password/reset")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        memberService.resetPassword(email, newPassword);

        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }

    // 💡 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<MemberDto.Response> getMyProfile(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(memberService.getMyProfile(email));
    }

    // 💡 회원정보 수정
    @PutMapping("/me")
    public ResponseEntity<AuthDto.TokenResponse> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody MemberDto.UpdateRequest request
    ) {
        String newToken = memberService.updateProfile(email, request);
        return ResponseEntity.ok(new AuthDto.TokenResponse(newToken));
    }

    // 💡 숙소 관리자 탈퇴 (보유 숙소/예약 존재 시 400 에러와 사유 메시지 반환)
    @PatchMapping("/me/downgrade-host")
    public ResponseEntity<?> downgradeHost(@AuthenticationPrincipal String email) {
        try {
            String newToken = memberService.downgradeHost(email);
            return ResponseEntity.ok(new AuthDto.TokenResponse(newToken));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}