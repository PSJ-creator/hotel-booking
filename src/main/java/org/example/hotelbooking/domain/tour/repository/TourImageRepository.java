package org.example.hotelbooking.domain.tour.repository;

import org.example.hotelbooking.domain.tour.entity.TourImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourImageRepository extends JpaRepository<TourImage, Long> {
    List<TourImage> findByTourAttraction_ContentIdOrderByImageIdAsc(String contentId);
}