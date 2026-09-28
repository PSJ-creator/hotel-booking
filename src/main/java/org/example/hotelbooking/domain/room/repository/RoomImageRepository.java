package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    // 💡 특정 객실의 사진들을 '정렬 순서(DisplayOrder)'에 맞춰서 가져오는 메서드
    List<RoomImage> findByRoom_RoomIdOrderByDisplayOrderAsc(Long roomId);
}