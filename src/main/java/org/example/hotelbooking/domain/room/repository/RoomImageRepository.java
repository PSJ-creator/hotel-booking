package org.example.hotelbooking.domain.room.repository;

import org.example.hotelbooking.domain.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    List<RoomImage> findByRoom_RoomIdOrderByDisplayOrderAsc(Long roomId);

    // 💡 JPQL 벌크 연산 도입: 특정 객실의 이미지 한 방에 삭제
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM RoomImage ri WHERE ri.room.roomId = :roomId")
    void deleteByRoom_RoomIdBulk(@Param("roomId") Long roomId);

    // 💡 특정 숙소에 딸린 모든 객실의 이미지를 한 방에 삭제
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM RoomImage ri WHERE ri.room.accommodation.contentId = :contentId")
    void deleteAllImagesByAccommodationIdBulk(@Param("contentId") String contentId);
}
