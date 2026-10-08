package org.example.hotelbooking.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // React 통신을 위한 CORS 설정
                .cors(Customizer.withDefaults())

                // REST API이므로 CSRF 보호 비활성화
                .csrf(csrf -> csrf.disable())

                // JWT를 사용하므로 서버 세션을 사용하지 않음
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // API 및 정적 리소스 접근 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 1. React 정적 리소스 전체 허용 (Vite 빌드 파일 및 루트)
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/vite.svg",
                                "/oauth/callback",
                                "/*.ico",
                                "/*.png",
                                "/*.jpg",
                                "/*.jpeg",
                                "/*.svg",
                                "/*.json",
                                "/*.js",
                                "/*.css"
                        ).permitAll()

                        // 💡 스프링 부트 기본 에러 페이지 포워딩 시 403 마스킹 방지
                        .requestMatchers("/error").permitAll()

                        // 로그인 / 회원가입
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 숙소 조회
                        .requestMatchers("/api/v1/accommodations/**").permitAll()

                        // 숙소 조회 API
                        .requestMatchers("/api/v1/stays/**").permitAll()

                        // 관광지 조회 api
                        .requestMatchers("/api/v1/tours/**").permitAll()

                        // 비밀번호 찾기 위한 허용 설정
                        .requestMatchers("/api/v1/members/password/**").permitAll()

                        // 토스페이먼츠 클라이언트 키 조회 허용
                        .requestMatchers("/api/v1/payments/client-key").permitAll()

                        // 숙소 리뷰 조회 허용
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/reviews/stays/**").permitAll()

                        // 그 외 요청은 JWT 인증 필요
                        .anyRequest().authenticated()
                )

                // JWT 인증 필터 등록
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // 비밀번호 암호화
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 로컬 개발 환경(Vite) + 배포 서버 IP 주소 허용
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://150.230.7.97:8080"
                )
        );

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS",
                        "PATCH"
                )
        );

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}