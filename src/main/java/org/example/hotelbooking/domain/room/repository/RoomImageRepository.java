package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    List<RoomImage> findByRoom_RoomIdOrderByDisplayOrderAsc(Long roomId);

    // 💡 객실 수정/삭제 시 기존 이미지 정리용
    void deleteByRoom_RoomId(Long roomId);
}