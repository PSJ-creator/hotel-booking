package org.example.hotelbooking.global.config;

import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaErrorController implements ErrorController {

    // 💡 스프링 부트가 모르는 주소(404)로 접속하면 모두 여기로 옵니다.
    @RequestMapping("/error")
    public String handleError() {
        // 에러를 띄우는 대신 리액트의 기본 화면인 index.html로 넘깁니다.
        // 그러면 리액트가 URL을 보고 알아서 알맞은 컴포넌트(KakaoCallback)를 띄워줍니다!
        return "forward:/index.html";
    }
}