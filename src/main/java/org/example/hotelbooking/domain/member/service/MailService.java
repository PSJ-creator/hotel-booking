package org.example.hotelbooking.domain.member.service; // 패키지 경로는 상황에 맞게 수정하세요

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;

    public void sendAuthCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[제주 야호] 비밀번호 찾기 인증 코드입니다.");
        message.setText("요청하신 인증 코드는 [" + code + "] 입니다.\n보안을 위해 3분 안에 입력해 주세요.");

        javaMailSender.send(message);
    }
}