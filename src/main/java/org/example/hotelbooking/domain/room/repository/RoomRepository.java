package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    // 💡 특정 숙소(Accommodation)에 속한 모든 객실 리스트를 가져오는 메서드
    List<Room> findByAccommodation_ContentId(String contentId);
}