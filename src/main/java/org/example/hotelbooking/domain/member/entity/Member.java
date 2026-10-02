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
}