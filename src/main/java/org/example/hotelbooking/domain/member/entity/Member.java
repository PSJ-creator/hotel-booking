package org.example.hotelbooking.domain.member.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "MEMBER")
public class Member {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEMBER_ID")
    private Long memberId;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_ID")
    private Role role;

    @Column(name = "BUSINESS_NO", unique = true, length = 50)
    private String businessNo;

    // 💡 DB의 STATUS 컬럼 매핑 ('ACTIVE', 'BLOCKED', 'WITHDRAWN', 'BANNED')
    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Member(String email, String password, String name, Role role, String businessNo) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.businessNo = businessNo;
    }

    public void updateToHost(String businessNo, Role role) {
        this.businessNo = businessNo;
        this.role = role;
    }
    public void updatePassword(String newPassword){
        this.password = newPassword;
    }

    public void updateInfo(String name) {
        this.name = name;
    }

    public void downgradeToUser(Role userRole) {
        this.role = userRole;
        this.businessNo = null; // 사업자번호 초기화
    }

    // 💡 회원 탈퇴 처리 편의 메서드
    // 1) status를 'WITHDRAWN'으로 변경
    // 2) 동일 이메일 재가입이 가능하도록 email을 고유한 unknown 형태로 변경 (UNIQUE 충돌 방지)
    // 3) 이름을 'Unknown'으로 변경 및 사업자번호 null 초기화
    public void withdraw(Role userRole) {
        this.status = "WITHDRAWN";
        this.name = "Unknown";
        this.email = "unknown_" + this.memberId + "_" + System.currentTimeMillis() + "@withdrawn.com";
        this.businessNo = null;
        if (userRole != null) {
            this.role = userRole;
        }
    }
}