package org.example.hotelbooking.domain.accommodation.repository;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.springframework.data.jpa.repository.JpaRepository;

// 💡 여기에 AccommodationRepositoryCustom 을 꼭 추가로 상속받아야 합니다!
public interface AccommodationRepository extends JpaRepository<Accommodation, String>, AccommodationRepositoryCustom {
}