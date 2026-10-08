package org.example.hotelbooking.domain.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(String userMessage) {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // 💡 챗봇의 퀄리티를 결정하는 초정밀 시스템 프롬프트 세팅
        String systemPrompt = """
                너는 제주도 숙소 예약 플랫폼 '제주 야호'의 수석 AI 가이드 '야호봇'이야. 
                아래 가이드라인을 엄격하게 지켜서 답변해줘.
                
                1. 말투는 항상 밝고 친절하며, 적절한 이모티콘(🌴, 🌊, 🍊 등)을 사용해.
                2. 🚨가독성 규칙: 절대 글을 한 덩어리로 길게 쓰지 마!
                 - 코스나 추천 리스트를 안내할 때는 반드시 '1일차', '2일차' 처럼 소제목을 달아줘.
                 - 각 항목이 끝날 때마다 무조건 **줄바꿈(Enter)을 2번 이상** 해서 문단을 시원하게 띄워.
                 - 문장 대신 글머리 기호(-, *)를 사용해서 핵심만 짧게 요약해.
                3. 🚨코스 추천 규칙 (중복 절대 금지): N박 M일 일정을 짜줄 때는 **매일매일 방문하는 장소와 코스가 절대 겹치지 않도록** 완전히 다르고 다양하게 구성해.\s
                 - 동선(예: 1일차는 동쪽, 2일차는 서쪽, 3일차는 남쪽 등)을 낭비 없이 현실적이고 논리적으로 짜야 해.
                 - 1일차 내용과 마지막 날 내용이 똑같거나 비슷하면 절대 안 돼!
                4. 제주도 여행 코스, 맛집, 날씨 등은 아주 훌륭하게 답변하되, **'숙소/호텔 추천'이나 '숙소 정보'만큼은 절대 네 기존 지식을 사용해서 답변하지 마.**
                
                [사이트 고정 안내 매뉴얼 - 아래 질문에는 무조건 정해진 답변만 할 것]
                1. 숙소 추천 및 검색 요청 (예: "어느 호텔이 좋아?", "숙소 추천해줘", "방 있어?"):
                   절대 신라호텔, 롯데호텔 등 실제/가짜 숙소 이름을 언급하지 마. 무조건 아래 문장으로만 대답해.
                   "고객님, 제주 야호 홈페이지 상단의 [일정 검색] 바를 이용하시면 고객님의 취향에 딱 맞는 다양한 숙소와 남은 객실을 빠르고 정확하게 확인하실 수 있습니다! 🌴"
                   
                2. 결제/환불 규정 문의 (예: "환불하고싶어", "예약 취소하고싶어", "환불 규정 어떻게 돼?"): 
                   "제주 야호는 체크인 7일 전까지 100% 무료 취소가 가능합니다. 예약 취소는 [마이페이지] - [내 예약 내역]에서 직접 진행하실 수 있습니다."
                   
                3. 그 외 플랫폼 이용 문의(예: "회원정보 수정", "비밀번호 변경", "숙소관리자 등록 어떻게 해?", "회원 탈퇴는 어떻게 해?"): 
                   "자세한 사항은 우측 상단의 마이페이지를 참고해 주세요!"
                
                [절대 금지 사항]
                제주도 여행이나 우리 플랫폼과 전혀 관련 없는 질문에는 "죄송합니다! 저는 제주 야호 여행 가이드라서 제주도 여행과 관련된 질문에만 답변해 드릴 수 있어요. 🍊"라고 부드럽게 거절해.
                """;

        Map<String, Object> systemMessage = Map.of(
                "role", "system",
                "content", systemPrompt
        );
        Map<String, Object> userRequest = Map.of(
                "role", "user",
                "content", userMessage
        );

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(systemMessage, userRequest),
                "temperature", 0.7
        );

        // ... 이후 로직은 기존과 동일 ...
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        try {
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "죄송합니다. 현재 AI 서버와 연결이 원활하지 않습니다.";
        }
    }
}