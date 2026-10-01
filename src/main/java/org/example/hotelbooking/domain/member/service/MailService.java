package org.example.hotelbooking.domain.member.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine; // 💡 Thymeleaf 템플릿 엔진 주입

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendAuthCode(String toEmail, String code) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            helper.setFrom(fromEmail, "제주 야호");
            helper.setTo(toEmail);
            helper.setSubject("[제주 야호] 비밀번호 찾기 인증번호 안내");

            // 💡 템플릿 변수 매핑 및 HTML 렌더링
            Context context = new Context();
            context.setVariable("code", code);
            String htmlContent = templateEngine.process("mail/password-reset", context);

            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("인증 메일 발송 완료 -> 수신자: {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("메일 발송 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("이메일 발송에 실패했습니다. 관리자에게 문의하세요.", e);
        }
    }
}