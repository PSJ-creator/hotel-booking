package org.example.hotelbooking.domain.member.repository;

import org.example.hotelbooking.domain.member.dto.AdminPartnerStatDto;
import org.example.hotelbooking.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 💡 로그인 시 이메일로 회원 정보를 찾기 위한 메서드
    Optional<Member> findByEmail(String email);

    // 💡 회원가입 시 이메일 중복 체크를 위한 메서드
    boolean existsByEmail(String email);

    // 💡 1. 파트너(호스트) 목록 및 각각의 숙소 수, 객실 수, 매출 총액 한 방에 조회!
    @Query("SELECT new org.example.hotelbooking.domain.member.dto.AdminPartnerStatDto(" +
            "m.memberId, m.name, m.email, m.businessNo, " +
            "(SELECT COUNT(a) FROM Accommodation a WHERE a.host = m), " +
            "(SELECT COUNT(r) FROM Room r WHERE r.accommodation.host = m), " +
            "(SELECT COALESCE(SUM(res.totalPrice), 0L) FROM Reservation res WHERE res.room.accommodation.host = m AND res.status = 'COMPLETED')" +
            ") " +
            "FROM Member m " +
            "WHERE m.role.roleName = 'ROLE_HOST' " +
            "ORDER BY m.createdAt DESC")
    List<AdminPartnerStatDto> getPartnerStatistics();
}