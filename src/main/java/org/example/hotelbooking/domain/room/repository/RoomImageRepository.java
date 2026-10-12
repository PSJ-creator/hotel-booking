package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    List<RoomImage> findByRoom_RoomIdOrderByDisplayOrderAsc(Long roomId);

    
    void deleteByRoom_RoomId(Long roomId);
}