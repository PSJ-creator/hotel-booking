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

        
        
        Role userRole = roleRepository.findByRoleName("ROLE_USER")
                .orElseThrow(() -> new IllegalArgumentException("시스템 에러: 기본 권한이 존재하지 않습니다."));

        
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) 
                .name(request.getName())
                .businessNo(request.getBusinessNo())
                .role(userRole)
                .build();

        
        memberRepository.save(member);
    }

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

        
        String token = jwtTokenProvider.createToken(member.getEmail(), member.getRole().getRoleName(), member.getName());

        return new AuthDto.TokenResponse(token);
    }

    
    @Transactional
    public String upgradeToHost(String email, String businessNo) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Role hostRole = roleRepository.findByRoleName("ROLE_HOST")
                .orElseThrow(() -> new IllegalArgumentException("ROLE_HOST 권한이 존재하지 않습니다."));

        
        
        member.updateToHost(businessNo, hostRole);

        return jwtTokenProvider.createToken(member.getEmail(), hostRole.getRoleName(), member.getName());
    }
}