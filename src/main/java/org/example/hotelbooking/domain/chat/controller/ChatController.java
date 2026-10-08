package org.example.hotelbooking.domain.chat.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.chat.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public Map<String, String> chatWithAI(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");

        if (userMessage == null || userMessage.trim().isEmpty()) {
            return Map.of("response", "메시지를 입력해 주세요.");
        }

        // AI 응답 받아오기
        String aiResponse = chatService.chat(userMessage);

        return Map.of("response", aiResponse);
    }
}