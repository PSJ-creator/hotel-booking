package org.example.hotelbooking.domain.member.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.entity.Member;
import org.example.hotelbooking.domain.member.entity.Role;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.example.hotelbooking.domain.member.repository.RoleRepository;
import org.example.hotelbooking.global.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    @Value("${kakao.client.id}")
    private String clientId;

    @Value("${kakao.redirect.uri}")
    private String redirectUri;

    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public String kakaoLogin(String code) {
        // 1. 카카오 서버로 인가 코드를 보내서 '액세스 토큰'을 받아옵니다.
        String accessToken = getAccessToken(code);

        // 2. 받아온 액세스 토큰으로 카카오 유저 정보(고유번호, 닉네임)를 가져옵니다.
        JsonNode userInfo = getUserInfo(accessToken);
        String kakaoId = userInfo.get("id").asText();
        String nickname = userInfo.get("properties").get("nickname").asText();

        // 3. 이메일을 못 받으므로, 카카오 고유번호를 이용해 가짜 이메일을 생성합니다.
        String dummyEmail = "kakao_" + kakaoId + "@hotel.com";

        // 4. DB에 이미 있는 유저인지 확인하고, 없으면 자동 회원가입 시킵니다.
        Member member = memberRepository.findByEmail(dummyEmail).orElseGet(() -> {
            Role userRole = roleRepository.findByRoleName("ROLE_USER")
                    .orElseThrow(() -> new IllegalArgumentException("기본 권한이 없습니다."));

            // 비밀번호는 랜덤 UUID로 생성해서 암호화 (어차피 카카오 로그인은 비밀번호를 안 씁니다)
            Member newMember = Member.builder()
                    .email(dummyEmail)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .name(nickname)
                    .role(userRole)
                    .build();
            return memberRepository.save(newMember);
        });

        // 5. 회원가입(또는 로그인)이 완료되었으니, 우리 사이트 전용 JWT 토큰을 발급합니다.
        return jwtTokenProvider.createToken(member.getEmail(), member.getRole().getRoleName(), member.getName());
    }

    // --- 카카오 API 통신 메서드 ---

    private String getAccessToken(String code) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<String> response = rt.postForEntity("https://kauth.kakao.com/oauth/token", request, String.class);

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(response.getBody());
            return node.get("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("카카오 토큰 발급 중 오류가 발생했습니다.", e);
        }
    }

    private JsonNode getUserInfo(String accessToken) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = rt.exchange("https://kapi.kakao.com/v2/user/me", HttpMethod.GET, request, String.class);

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("카카오 유저 정보 조회 중 오류가 발생했습니다.", e);
        }
    }
}