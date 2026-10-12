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
        
        String accessToken = getAccessToken(code);

        
        JsonNode userInfo = getUserInfo(accessToken);
        String kakaoId = userInfo.get("id").asText();
        String nickname = userInfo.get("properties").get("nickname").asText();

        
        String dummyEmail = "kakao_" + kakaoId + "@hotel.com";

        
        Member member = memberRepository.findByEmail(dummyEmail).orElseGet(() -> {
            Role userRole = roleRepository.findByRoleName("ROLE_USER")
                    .orElseThrow(() -> new IllegalArgumentException("기본 권한이 없습니다."));

            
            Member newMember = Member.builder()
                    .email(dummyEmail)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .name(nickname)
                    .role(userRole)
                    .build();
            return memberRepository.save(newMember);
        });

        
        return jwtTokenProvider.createToken(member.getEmail(), member.getRole().getRoleName(), member.getName());
    }

    

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