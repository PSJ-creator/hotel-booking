package org.example.hotelbooking.domain.accommodation.repository;

import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import java.util.List;

public interface AccommodationRepositoryCustom {
    
    List<Accommodation> findAccommodationsInMap(String minX, String maxX, String minY, String maxY);
}
