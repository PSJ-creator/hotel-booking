package org.example.hotelbooking.global.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

// 💡 롬복을 써서 JwtTokenProvider를 자동으로 주입받습니다.
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 사용자 요청 헤더에서 JWT 토큰을 쓱 뽑아옵니다. (아래 만들어둔 resolveToken 메서드 사용)
        String token = resolveToken(request);

        // 2. 토큰이 비어있지 않고, 진품(유효기간 안 지남 등)인지 검사합니다.
        if (token != null && jwtTokenProvider.validateToken(token)) {

            // 3. 진품이라면 토큰 안에 적혀있는 사용자 이메일(Subject)과 역할(Role)을 꺼냅니다.
            String email = jwtTokenProvider.getUserEmail(token);
            String role = jwtTokenProvider.getUserRole(token);

            // 4. 꺼낸 정보를 바탕으로 "이 사람은 인증된 사용자입니다" 라는 확인증(Authentication 객체)을 만듭니다.
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority(role))
            );

            // 5. 스프링 시큐리티의 핵심 저장소(SecurityContext)에 이 확인증을 예쁘게 보관해 둡니다.
            //    (이렇게 해두면 나중에 컨트롤러에서 @AuthenticationPrincipal 로 이 사람 정보를 꺼내 쓸 수 있습니다!)
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 6. 검사가 끝났으니 다음 필터나 컨트롤러로 무사히 넘겨줍니다.
        filterChain.doFilter(request, response);
    }

    // 💡 프론트엔드가 보낸 요청(Header) 주머니에서 "Bearer xxxx.yyyy.zzzz" 형태의 토큰만 쏙 빼내는 기능
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        // 토큰이 존재하고, "Bearer "로 시작하면 (7글자)
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 이후의 진짜 토큰 부분만 잘라서 반환
        }
        return null; // 토큰이 없으면 null 반환
    }
}