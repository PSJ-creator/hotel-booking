package org.example.hotelbooking.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    // 하단 코드는 예제코드로 차후 삭제 요망
    @GetMapping("/hello")
    public Map<String, Object> getHelloMessage() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "스프링 부트 서버와 리액트 연동 성공!");
        response.put("port", 8080);
        return response;
    }
}