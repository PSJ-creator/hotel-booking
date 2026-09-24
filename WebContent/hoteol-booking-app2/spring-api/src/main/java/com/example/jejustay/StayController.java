package com.example.jejustay;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.config.annotation.*;

@RestController
@RequestMapping("/api")
public class StayController {
  private final JdbcTemplate db;
  public StayController(JdbcTemplate db) { this.db=db; }

  @GetMapping("/stays")
  public List<Stay> stays() {
    return db.query("SELECT id,name,region,stay_type,address_sido,address,base_price,thumbnail_url,description,nearby FROM stay WHERE active=1 ORDER BY id DESC",(rs,n)->new Stay(
      rs.getLong("id"),rs.getString("name"),rs.getString("region"),rs.getString("stay_type"),rs.getString("address_sido"),rs.getString("address"),rs.getBigDecimal("base_price"),rs.getString("thumbnail_url"),
      db.query("SELECT image_url FROM stay_image WHERE stay_id=? ORDER BY sort_order,id",(ir,i)->ir.getString(1),rs.getLong("id")),rs.getString("description"),rs.getString("nearby")));
  }

  @PostMapping("/reservations")
  @Transactional
  public ResponseEntity<Map<String,Object>> reserve(@Valid @RequestBody Booking request) {
    if (!request.checkOut().isAfter(request.checkIn()) || request.checkIn().isBefore(LocalDate.now()) || request.checkOut().isAfter(request.checkIn().plusDays(30)))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"예약 날짜를 확인해 주세요. 최대 30박까지 요청할 수 있습니다.");
    // Serialize requests for the same stay so availability checks cannot race.
    var prices=db.query("SELECT base_price FROM stay WHERE id=? AND active=1 FOR UPDATE",(rs,n)->rs.getBigDecimal(1),request.stayId());
    if(prices.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"숙소를 찾을 수 없습니다.");
    Integer occupied=db.queryForObject("SELECT COUNT(*) FROM reservation WHERE stay_id=? AND status IN ('REQUESTED','CONFIRMED') AND check_in<? AND check_out>?",Integer.class,request.stayId(),request.checkOut(),request.checkIn());
    // Current schema models one bookable unit per stay. Add room inventory before multiple simultaneous room bookings.
    if(occupied!=null && occupied>0) throw new ResponseStatusException(HttpStatus.CONFLICT,"이미 예약 요청이 있는 날짜입니다.");
    String code="JS-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT);
    db.update("INSERT INTO reservation (reservation_code,stay_id,check_in,check_out,guests,guest_name,phone,nightly_base_price,status) VALUES (?,?,?,?,?,?,?,?, 'REQUESTED')",
      code,request.stayId(),request.checkIn(),request.checkOut(),request.guests(),request.guestName().trim(),request.phone().trim(),prices.get(0));
    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("reservationCode",code,"status","REQUESTED"));
  }
  public record Stay(long id,String name,String region,String type,String addressSido,String address,BigDecimal basePrice,String thumbnailUrl,List<String> imageUrls,String description,String nearby) {}
  public record Booking(@NotNull Long stayId,@NotNull LocalDate checkIn,@NotNull LocalDate checkOut,@Min(1) @Max(20) int guests,@NotBlank @Size(max=80) String guestName,@NotBlank @Pattern(regexp="[0-9+ -]{9,20}") String phone) {}
}

@org.springframework.context.annotation.Configuration
class CorsConfig implements WebMvcConfigurer {
  @Value("${app.allowed-origin}") private String origin;
  @Override public void addCorsMappings(CorsRegistry registry) {registry.addMapping("/api/**").allowedOrigins(origin).allowedMethods("GET","POST","OPTIONS").allowedHeaders("Content-Type");}
}
