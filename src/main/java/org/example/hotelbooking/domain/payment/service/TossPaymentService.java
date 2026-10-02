package org.example.hotelbooking.domain.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TossPaymentService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${toss.secret.key}")
    private String tossSecretKey;

    @Value("${toss.client.key:}")
    private String tossClientKey;

    public String getTossClientKey() {
        return tossClientKey;
    }

    // 1. 결제 최종 승인 API 호출
    public void confirmPayment(String paymentKey, String orderId, Integer amount) {
        String url = "https://api.tosspayments.com/v1/payments/confirm";

        Map<String, Object> params = new HashMap<>();
        params.put("paymentKey", paymentKey);
        params.put("orderId", orderId);
        params.put("amount", amount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(params, getHeaders());

        try {
            restTemplate.postForEntity(url, request, String.class);
            log.info("✅ 토스 결제 승인 완료 - OrderId: {}", orderId);

        } catch (HttpStatusCodeException e) {
            // 💡 추가된 부분: 토스 서버가 거절한 "진짜 이유(JSON)"를 콘솔에 출력합니다!
            log.error("❌ 토스 결제 승인 거절됨: {}", e.getResponseBodyAsString());
            throw new RuntimeException("결제 승인 거절: " + e.getResponseBodyAsString());

        } catch (Exception e) {
            log.error("❌ 토스 결제 승인 실패 (통신 오류): {}", e.getMessage());
            throw new RuntimeException("결제 승인 중 통신 오류가 발생했습니다.");
        }
    }

    // 2. 결제 취소(환불) API 호출 (보상 트랜잭션용)
    public void cancelPayment(String paymentKey, String cancelReason) {
        String url = "https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel";

        Map<String, Object> params = new HashMap<>();
        params.put("cancelReason", cancelReason);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(params, getHeaders());

        try {
            restTemplate.postForEntity(url, request, String.class);
            log.info("🔄 토스 결제 자동 취소(환불) 완료 - PaymentKey: {}, 사유: {}", paymentKey, cancelReason);
        } catch (Exception e) {
            log.error("❌ 토스 결제 자동 취소 실패 - 수동 환불 필요: {}", e.getMessage());
            // 실무에서는 여기에 슬랙 알림 등을 붙여서 관리자가 수동으로 환불하게 만듭니다.
        }
    }

    // 토스페이먼츠 Basic Auth 헤더 생성 (시크릿키 뒤에 콜론(:)을 붙여서 Base64 인코딩)
    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String encodedAuth = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));
        headers.setBasicAuth(encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}