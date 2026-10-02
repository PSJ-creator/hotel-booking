package org.example.hotelbooking.domain.tour.repository;

import org.example.hotelbooking.domain.tour.entity.TourAttraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourAttractionRepository extends JpaRepository<TourAttraction, String> {
    List<TourAttraction> findAllByOrderByTitleAsc();
}