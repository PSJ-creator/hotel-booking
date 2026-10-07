package org.example.hotelbooking.domain.member.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.dto.AuthDto;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.entity.Role;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.member.repository.RoleRepository;
import org.example.hotelbooking.global.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

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

    @Transactional(readOnly = true)
    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        // 1. 이메일로 회원 찾기
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        // 탈퇴한 계정(WITHDRAWN)인지 확인
        if ("WITHDRAWN".equals(member.getStatus())) {
            throw new IllegalArgumentException("이미 탈퇴 처리된 계정입니다.");
        }

        // 2. 비밀번호 일치 여부 확인 (입력된 평문 비밀번호 vs DB의 암호화된 비밀번호)
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 성공 시 JWT 토큰 생성 후 반환 (member.getRole().getRoleName()으로 "ROLE_USER" 추출)
        String token = jwtTokenProvider.createToken(member.getEmail(), member.getRole().getRoleName(), member.getName());

        return new AuthDto.TokenResponse(token);
    }

    // 유저에서 숙소관리자 신청 후 숙소관리자(ROLE_HOST) 권한 부여 로직
    @Transactional
    public String upgradeToHost(String email, String businessNo) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Role hostRole = roleRepository.findByRoleName("ROLE_HOST")
                .orElseThrow(() -> new IllegalArgumentException("ROLE_HOST 권한이 존재하지 않습니다."));

        // 리플렉션이나 setter 없이 엔티티 업데이트 (Member 엔티티에 비즈니스 메서드가 없다면 builder 또는 편의 메서드 활용)
        // Member.java에 호스트 전환용 메서드를 추가하거나 아래처럼 필드를 변경합니다.
        member.updateToHost(businessNo, hostRole);

        return jwtTokenProvider.createToken(member.getEmail(), hostRole.getRoleName(), member.getName());
    }
}