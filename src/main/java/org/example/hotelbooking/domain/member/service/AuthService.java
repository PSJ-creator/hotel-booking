package org.example.hotelbooking.domain.member.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.dto.AuthDto;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.entity.Role;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.member.repository.RoleRepository;
import org.example.hotelbooking.global.security.JwtTokenProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public void signup(AuthDto.SignupRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // 💡 1. 사업자등록번호 유무에 따라 부여할 권한 결정 (호스트 체크 시 ROLE_HOST, 일반 시 ROLE_USER)
        boolean isHost = request.getBusinessNo() != null && !request.getBusinessNo().trim().isEmpty();
        String targetRoleName = isHost ? "ROLE_HOST" : "ROLE_USER";

        Role assignedRole = roleRepository.findByRoleName(targetRoleName)
                .orElseThrow(() -> new IllegalArgumentException("시스템 에러: " + targetRoleName + " 권한이 존재하지 않습니다."));

        // 💡 2. 동적으로 결정된 assignedRole 세팅 및 Member 엔티티 조립
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt 암호화!
                .name(request.getName())
                .businessNo(isHost ? request.getBusinessNo().trim() : null)
                .role(assignedRole) // ✅ 호스트 가입 시 ROLE_HOST (ROLE_ID: 2) 할당
                .status("ACTIVE")
                .build();

        // 3. DB에 저장
        memberRepository.save(member);
    }

    // 💡 로그인 시 Access + Refresh Token 모두 발급 및 Redis 저장
    @Transactional(readOnly = true)
    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if ("WITHDRAWN".equals(member.getStatus())) {
            throw new IllegalArgumentException("이미 탈퇴 처리된 계정입니다.");
        }

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 1. 토큰 2개 발급
        String accessToken = jwtTokenProvider.createToken(member.getEmail(), member.getRole().getRoleName(), member.getName());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getEmail());

        // 2. Redis에 Refresh Token 저장 (Key: "RT:이메일", Value: 토큰값, 유효기간: 7일)
        redisTemplate.opsForValue().set("RT:" + member.getEmail(), refreshToken, 7, TimeUnit.DAYS);

        return new AuthDto.TokenResponse(accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public AuthDto.TokenResponse reissueToken(String refreshToken) {
        // 1. 넘어온 RT 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Refresh Token이 만료되었거나 유효하지 않습니다.");
        }

        // 2. 토큰에서 이메일 추출
        String email = jwtTokenProvider.getUserEmail(refreshToken);

        // 3. Redis에 저장된 진짜 RT와 비교
        String savedToken = redisTemplate.opsForValue().get("RT:" + email);
        if (savedToken == null || !savedToken.equals(refreshToken)) {
            throw new IllegalArgumentException("변조되거나 로그아웃된 Refresh Token입니다.");
        }

        // 4. 문제없다면 새 Access Token 생성 후 반환 (RT는 기존 것 그대로 재사용)
        Member member = memberRepository.findByEmail(email).orElseThrow();
        String newAccessToken = jwtTokenProvider.createToken(email, member.getRole().getRoleName(), member.getName());

        return new AuthDto.TokenResponse(newAccessToken, refreshToken);
    }
    // 유저에서 숙소관리자 신청 후 숙소관리자(ROLE_HOST) 권한 부여 로직
    @Transactional
    public AuthDto.TokenResponse upgradeToHost(String email, String businessNo) {
        Member member = memberRepository.findByEmail(email).orElseThrow();
        Role hostRole = roleRepository.findByRoleName("ROLE_HOST").orElseThrow();
        member.updateToHost(businessNo, hostRole);

        // 호스트 전환 시에도 두 토큰 모두 갱신
        String accessToken = jwtTokenProvider.createToken(member.getEmail(), hostRole.getRoleName(), member.getName());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getEmail());
        redisTemplate.opsForValue().set("RT:" + member.getEmail(), refreshToken, 7, TimeUnit.DAYS);

        return new AuthDto.TokenResponse(accessToken, refreshToken);
    }
}