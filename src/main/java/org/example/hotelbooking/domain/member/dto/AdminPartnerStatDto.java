package org.example.hotelbooking.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminPartnerStatDto {
    private Long memberId;
    private String hostName;       // 숙소 주인 이름
    private String email;
    private String businessNo;     // 사업자 번호
    private Long accomCount;       // 운영 중인 숙소 수
    private Long roomCount;        // 운영 중인 총 객실 수
    private Long totalRevenue;     // 해당 호스트가 벌어들인 총 결제액
}