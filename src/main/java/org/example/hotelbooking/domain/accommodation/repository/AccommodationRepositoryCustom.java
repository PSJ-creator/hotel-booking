package org.example.hotelbooking.domain.accommodation.repository;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import java.util.List;

public interface AccommodationRepositoryCustom {
    // 화면의 남서쪽(min)과 북동쪽(max) 좌표를 받아 그 안의 '승인된' 숙소만 검색
    List<Accommodation> findAccommodationsInMap(String minX, String maxX, String minY, String maxY);
}