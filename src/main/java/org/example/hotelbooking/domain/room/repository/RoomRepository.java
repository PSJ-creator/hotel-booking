package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    
    List<Room> findByAccommodation_ContentId(String contentId);
}