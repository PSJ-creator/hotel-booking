package org.example.hotelbooking.domain.member.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final MailService mailService;
    private final StringRedisTemplate redisTemplate;

    public void sendPasswordResetCode(String email) {
        // 1. 이메일로 회원 정보 조회 (존재 여부 확인)
        org.example.hotelbooking.domain.member.entity.Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        // 💡 2. 카카오 이메일 패턴으로 소셜 가입자 판별 및 차단
        if (email.startsWith("kakao_") && email.endsWith("@hotel.com")) {
            throw new IllegalArgumentException("카카오 소셜 로그인으로 가입된 계정입니다. 카카오 로그인을 이용해 주세요.");
        }

        // 3. 6자리 랜덤 인증 코드 생성 (100000 ~ 999999)
        String code = String.valueOf((int) (Math.random() * 899999) + 100000);

        // 4. Redis에 저장 (키: "PWD_RESET:이메일", 값: 코드, 만료시간: 3분)
        String redisKey = "PWD_RESET:" + email;
        redisTemplate.opsForValue().set(redisKey, code, 3, java.util.concurrent.TimeUnit.MINUTES);

        // 5. 이메일 발송
        mailService.sendAuthCode(email, code);
    }
    // 💡 2번 API: 인증 코드만 검증하고 합격 티켓 부여
    public void verifyResetCode(String email, String inputCode) {
        String redisKey = "PWD_RESET:" + email;
        String savedCode = redisTemplate.opsForValue().get(redisKey);

        if (savedCode == null || !savedCode.equals(inputCode)) {
            throw new IllegalArgumentException("인증 코드가 일치하지 않거나 만료되었습니다.");
        }

        // 인증 성공 시, 기존 인증 코드는 삭제
        redisTemplate.delete(redisKey);

        // "이메일 인증 완료" 상태를 Redis에 10분간 저장 (합격 티켓)
        redisTemplate.opsForValue().set("PWD_RESET_VERIFIED:" + email, "TRUE", 10, java.util.concurrent.TimeUnit.MINUTES);
    }

    // 💡 3번 API: 합격 티켓 확인 후 실제 비밀번호 변경
    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(String email, String newPassword) {
        String verifiedKey = "PWD_RESET_VERIFIED:" + email;
        String isVerified = redisTemplate.opsForValue().get(verifiedKey);

        // 1. 합격 티켓이 없으면 에러 (인증 안 하고 바로 변경 시도한 경우)
        if (isVerified == null) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았거나 만료되었습니다. 다시 인증해 주세요.");
        }

        // 2. 회원 조회 및 비밀번호 변경
        org.example.hotelbooking.domain.member.entity.Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        // 💡 실무 주의: Spring Security를 쓰고 계시다면 passwordEncoder.encode(newPassword)로 암호화해야 합니다!
        member.updatePassword(newPassword);

        // 3. 비밀번호 변경이 끝났으므로 합격 티켓 삭제 (재사용 방지)
        redisTemplate.delete(verifiedKey);
    }
}