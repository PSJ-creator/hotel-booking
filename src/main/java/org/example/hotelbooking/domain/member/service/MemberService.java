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
        member.updatePassword(passwordEncoder.encode(newPassword));

        // 3. 비밀번호 변경이 끝났으므로 합격 티켓 삭제 (재사용 방지)
        redisTemplate.delete(verifiedKey);
    }

    // 💡 1. 내 정보 조회
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

    // 💡 2. 회원정보 수정 (이름, 비밀번호)
    @Transactional
    public String updateProfile(String email, MemberDto.UpdateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 이름 변경
        if (request.getName() != null && !request.getName().isBlank()) {
            member.updateInfo(request.getName().trim());
        }

        // 비밀번호 변경 (입력된 경우에만 검증 후 변경)
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

        // 변경된 닉네임이 반영된 새 JWT 토큰 발급
        return jwtTokenProvider.createToken(member.getEmail(), member.getRole().getRoleName(), member.getName());
    }

    // 💡 3. 숙소 관리자 탈퇴 (보유 숙소 또는 진행 예정 예약이 있으면 차단!)
    @Transactional
    public String downgradeHost(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!"ROLE_HOST".equals(member.getRole().getRoleName())) {
            throw new IllegalArgumentException("숙소 관리자 권한을 가진 회원만 신청할 수 있습니다.");
        }

        // [검증 1] 내 숙소에 투숙 예정/진행 중인 예약이 남아있는지 확인
        LocalDate today = LocalDate.now();
        List<Reservation> hostReservations = reservationRepository.findReservationsByHostId(member.getMemberId());
        boolean hasUpcomingReservation = hostReservations.stream()
                .anyMatch(r -> !"CANCELED".equals(r.getStatus()) && r.getCheckOutDate().isAfter(today));

        if (hasUpcomingReservation) {
            throw new IllegalStateException("현재 투숙 예정이거나 진행 중인 예약이 존재하여 숙소 관리자 자격을 해지할 수 없습니다.");
        }

        // [검증 2] 등록된 숙소가 존재하는지 확인
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

    // 💡 4. 회원 탈퇴 (status -> WITHDRAWN, 이름/이메일 Unknown 처리)
    @Transactional
    public void withdrawMember(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();

        // [검증 1] 일반 유저(게스트)로서 체크아웃 전인 진행 예정 예약이 있는지 확인
        List<Reservation> myGuestReservations = reservationRepository
                .findByMember_MemberIdOrderByCreatedAtDesc(member.getMemberId());
        boolean hasUpcomingGuestRes = myGuestReservations.stream()
                .anyMatch(r -> !"CANCELED".equals(r.getStatus()) && r.getCheckOutDate().isAfter(today));

        if (hasUpcomingGuestRes) {
            throw new IllegalStateException("이용 예정이거나 투숙 중인 예약이 존재하여 탈퇴할 수 없습니다. 예약을 먼저 취소해 주세요.");
        }

        // [검증 2] 호스트(ROLE_HOST)인 경우 보유 숙소나 호스트 예약이 남아있는지 확인
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

        // 상태 WITHDRAWN 변경 및 이메일/이름 Unknown 처리 (기존 예약·리뷰 FK는 깨지지 않고 유지됨!)
        member.withdraw(userRole);
    }
}