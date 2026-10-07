package org.example.hotelbooking.domain.member.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.member.dto.AdminPartnerStatDto;
import org.example.hotelbooking.domain.member.repository.MemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/partners")
@PreAuthorize("hasRole('ADMIN')") // 💡 총괄 관리자만 접근 가능하도록 보호
public class AdminPartnerController {

    private final MemberRepository memberRepository;

    // 💡 관리자용 파트너 통계 및 매출 조회 API
    @GetMapping("/stats")
    public ResponseEntity<List<AdminPartnerStatDto>> getPartnerStats() {
        // MemberRepository에 만들어둔 통계 쿼리를 바로 호출하여 반환합니다.
        return ResponseEntity.ok(memberRepository.getPartnerStatistics());
    }
}