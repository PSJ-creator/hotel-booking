package org.example.hotelbooking.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. REST API이므로 CSRF(크로스 사이트 요청 위조) 보호 기능 비활성화
                .csrf(csrf -> csrf.disable())

                // 2. JWT 토큰을 사용할 것이므로 서버에 세션을 저장하지 않음 (STATELESS)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 3. API 요청에 대한 접근 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 회원가입, 로그인 API와 방금 만든 숙소 검색 API는 출입증 없이도(비회원도) 누구나 접근 가능
                        .requestMatchers("/api/v1/auth/**", "/api/v1/accommodations/**").permitAll()
                        // 그 외의 모든 요청은 출입증(JWT 토큰)이 있어야만 접근 가능
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 💡 비밀번호를 안전하게 암호화(해싱)해주는 객체
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}