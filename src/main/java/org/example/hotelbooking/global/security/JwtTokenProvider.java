package org.example.hotelbooking.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    private final Key key;
    private final long expirationTime;

    // yml 또는 properties 파일의 값을 불러와서 Key 객체로 만듭니다.
    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey,
                            @Value("${jwt.expiration}") long expirationTime) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationTime = expirationTime;
    }

    // 💡 1. 토큰 생성 (로그인 성공 시 프론트엔드로 내려줄 출입증)
    // 프론트엔드에서 로그인 시 실제 닉네임을 띄우기 위해 String name, .claim("name", name) 추가
    public String createToken(String email, String role, String name) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + this.expirationTime);

        return Jwts.builder()
                .setSubject(email) // 토큰 주인을 이메일로 기록
                .claim("role", role) // 권한 정보 기록 (예: ROLE_USER)
                .claim("name", name) // 💡 토큰 claim에 DB name 추가
                .setIssuedAt(now) // 발행 시간
                .setExpiration(validity) // 만료 시간
                .signWith(key, SignatureAlgorithm.HS256) // 암호화 알고리즘
                .compact();
    }

    // 💡 2. 토큰 유효성 검증 (API 요청이 올 때마다 진짜 출입증인지 확인)
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;

    }
    // 💡 3. 토큰을 분해해서 주인의 이메일(Subject)을 꺼내는 기능
    public String getUserEmail(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 💡 4. 토큰을 분해해서 주인의 권한(Role)을 꺼내는 기능
    public String getUserRole(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
}