package org.example.hotelbooking.domain.member.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine; 

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendAuthCode(String toEmail, String code) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            helper.setFrom(fromEmail, "제주 야호");
            helper.setTo(toEmail);
            helper.setSubject("[제주 야호] 비밀번호 찾기 인증번호 안내");

            
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

    
    @Async
    public void sendReservationConfirmation(
            String toEmail,
            String guestName,
            Long reservationId,
            String contentId,
            String stayTitle,
            String stayAddr,
            String stayTel,
            String checkinTime,
            String checkoutTime,
            String roomTitle,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            Integer totalPrice
    ) {
        
        if (toEmail == null || (toEmail.startsWith("kakao_") && toEmail.endsWith("@hotel.com"))) {
            log.info("소셜 로그인 가짜 이메일 계정이므로 예약 확인 메일 발송을 생략합니다: {}", toEmail);
            return;
        }

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            helper.setFrom(fromEmail, "제주 야호");
            helper.setTo(toEmail);
            helper.setSubject("[제주 야호] '" + stayTitle + "' 숙소 예약이 확정되었습니다.");

            long nights = Math.max(1, ChronoUnit.DAYS.between(checkInDate, checkOutDate));
            String reservationNo = "#" + checkInDate.toString().replace("-", "") + "-" + String.format("%04d", reservationId);
            String formattedPrice = NumberFormat.getNumberInstance(Locale.KOREA).format(totalPrice != null ? totalPrice : 0) + "원";

            Context context = new Context();
            context.setVariable("guestName", guestName);
            context.setVariable("reservationNo", reservationNo);
            context.setVariable("stayTitle", stayTitle);
            context.setVariable("stayAddr", stayAddr != null ? stayAddr : "제주특별자치도");
            context.setVariable("stayTel", stayTel != null ? stayTel : "숙소 문의");
            context.setVariable("checkinTime", checkinTime != null ? checkinTime : "15:00");
            context.setVariable("checkoutTime", checkoutTime != null ? checkoutTime : "11:00");
            context.setVariable("roomTitle", roomTitle);
            context.setVariable("checkInDate", checkInDate.toString());
            context.setVariable("checkOutDate", checkOutDate.toString());
            context.setVariable("nights", nights);
            context.setVariable("totalPriceFormatted", formattedPrice);

            
            context.setVariable("myReservationsUrl", "http://localhost:5173/my-reservations");
            context.setVariable("stayDetailUrl", "http://localhost:5173/stays/" + contentId);

            String htmlContent = templateEngine.process("mail/reservation-confirm", context);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("✅ 예약 확정 이메일 발송 완료 -> 수신자: {}, 예약번호: {}", toEmail, reservationNo);

        } catch (Exception e) {
            
            log.error("❌ 예약 확정 이메일 발송 실패 (수신자: {}): {}", toEmail, e.getMessage());
        }
    }
}