package org.example.hotelbooking.domain.member.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.repository.AccommodationRepository;
import org.example.hotelbooking.domain.member.dto.MemberDto;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.entity.Role;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.member.repository.RoleRepository;
import org.example.hotelbooking.domain.reservation.entity.Reservation;
import org.example.hotelbooking.domain.reservation.repository.ReservationRepository;
import org.example.hotelbooking.global.security.JwtTokenProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final AccommodationRepository accommodationRepository;
    private final ReservationRepository reservationRepository;
    private final MailService mailService;
    private final StringRedisTemplate redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public void sendPasswordResetCode(String email) {
        
        org.example.hotelbooking.domain.member.entity.Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        
        if (email.startsWith("kakao_") && email.endsWith("@hotel.com")) {
            throw new IllegalArgumentException("카카오 소셜 로그인으로 가입된 계정입니다. 카카오 로그인을 이용해 주세요.");
        }

        
        String code = String.valueOf((int) (Math.random() * 899999) + 100000);

        
        String redisKey = "PWD_RESET:" + email;
        redisTemplate.opsForValue().set(redisKey, code, 3, java.util.concurrent.TimeUnit.MINUTES);

        
        mailService.sendAuthCode(email, code);
    }
    
    public void verifyResetCode(String email, String inputCode) {
        String redisKey = "PWD_RESET:" + email;
        String savedCode = redisTemplate.opsForValue().get(redisKey);

        if (savedCode == null || !savedCode.equals(inputCode)) {
            throw new IllegalArgumentException("인증 코드가 일치하지 않거나 만료되었습니다.");
        }

        
        redisTemplate.delete(redisKey);

        
        redisTemplate.opsForValue().set("PWD_RESET_VERIFIED:" + email, "TRUE", 10, java.util.concurrent.TimeUnit.MINUTES);
    }

    
    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(String email, String newPassword) {
        String verifiedKey = "PWD_RESET_VERIFIED:" + email;
        String isVerified = redisTemplate.opsForValue().get(verifiedKey);

        
        if (isVerified == null) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았거나 만료되었습니다. 다시 인증해 주세요.");
        }

        
        org.example.hotelbooking.domain.member.entity.Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        
        member.updatePassword(passwordEncoder.encode(newPassword));

        
        redisTemplate.delete(verifiedKey);
    }

    
    @Transactional(readOnly = true)
    public MemberDto.Response getMyProfile(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean isSocial = email.startsWith("kakao_") && email.endsWith("@hotel.com");

        return MemberDto.Response.builder()
                .email(member.getEmail())
                .name(member.getName())
                .role(member.getRole().getRoleName())
                .businessNo(member.getBusinessNo())
                .isSocial(isSocial)
                .build();
    }

    
    @Transactional
    public String updateProfile(String email, MemberDto.UpdateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        
        if (request.getName() != null && !request.getName().isBlank()) {
            member.updateInfo(request.getName().trim());
        }

        
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            boolean isSocial = email.startsWith("kakao_") && email.endsWith("@hotel.com");
            if (isSocial) {
                throw new IllegalArgumentException("소셜 로그인 회원은 비밀번호를 변경할 수 없습니다.");
            }

            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
                throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
            }

            member.updatePassword(passwordEncoder.encode(request.getNewPassword()));
        }

        
        return jwtTokenProvider.createToken(member.getEmail(), member.getRole().getRoleName(), member.getName());
    }

    
    @Transactional
    public String downgradeHost(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!"ROLE_HOST".equals(member.getRole().getRoleName())) {
            throw new IllegalArgumentException("숙소 관리자 권한을 가진 회원만 신청할 수 있습니다.");
        }

        
        LocalDate today = LocalDate.now();
        List<Reservation> hostReservations = reservationRepository.findReservationsByHostId(member.getMemberId());
        boolean hasUpcomingReservation = hostReservations.stream()
                .anyMatch(r -> !"CANCELED".equals(r.getStatus()) && r.getCheckOutDate().isAfter(today));

        if (hasUpcomingReservation) {
            throw new IllegalStateException("현재 투숙 예정이거나 진행 중인 예약이 존재하여 숙소 관리자 자격을 해지할 수 없습니다.");
        }

        
        List<Accommodation> myAccommodations = accommodationRepository.findByHost_Email(email);
        if (!myAccommodations.isEmpty()) {
            throw new IllegalStateException(
                    "등록된 숙소(" + myAccommodations.size() + "곳)가 존재하여 숙소 관리자 자격을 해지할 수 없습니다. 더이상 서비스하지 않는 경우 숙소 삭제 후 해지 바랍니다."
            );
        }

        Role userRole = roleRepository.findByRoleName("ROLE_USER")
                .orElseThrow(() -> new IllegalArgumentException("ROLE_USER 권한이 존재하지 않습니다."));

        member.downgradeToUser(userRole);

        return jwtTokenProvider.createToken(member.getEmail(), userRole.getRoleName(), member.getName());
    }

    
    @Transactional
    public void withdrawMember(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();

        
        List<Reservation> myGuestReservations = reservationRepository
                .findByMember_MemberIdOrderByCreatedAtDesc(member.getMemberId());
        boolean hasUpcomingGuestRes = myGuestReservations.stream()
                .anyMatch(r -> !"CANCELED".equals(r.getStatus()) && r.getCheckOutDate().isAfter(today));

        if (hasUpcomingGuestRes) {
            throw new IllegalStateException("이용 예정이거나 투숙 중인 예약이 존재하여 탈퇴할 수 없습니다. 예약을 먼저 취소해 주세요.");
        }

        
        if ("ROLE_HOST".equals(member.getRole().getRoleName())) {
            List<Reservation> hostReservations = reservationRepository.findReservationsByHostId(member.getMemberId());
            boolean hasUpcomingHostRes = hostReservations.stream()
                    .anyMatch(r -> !"CANCELED".equals(r.getStatus()) && r.getCheckOutDate().isAfter(today));

            List<Accommodation> myAccommodations = accommodationRepository.findByHost_Email(email);

            if (hasUpcomingHostRes || !myAccommodations.isEmpty()) {
                throw new IllegalStateException("보유 중인 숙소 또는 진행 예정인 예약이 존재하여 탈퇴할 수 없습니다. 숙소 삭제 후 다시 시도해 주세요.");
            }
        }

        Role userRole = roleRepository.findByRoleName("ROLE_USER").orElse(member.getRole());

        
        member.withdraw(userRole);
    }
}