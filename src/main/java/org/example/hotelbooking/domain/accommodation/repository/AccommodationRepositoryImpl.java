package org.example.hotelbooking.domain.accommodation.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.example.hotelbooking.domain.accommodation.entity.Accommodation;
import org.example.hotelbooking.domain.accommodation.entity.AccommodationStatus;
import org.springframework.stereotype.Repository;

import java.util.List;

// QAccommodation 임포트 (빨간 줄 뜨면 Build -> Build Project 한 번 눌러주세요)
import static org.example.hotelbooking.domain.accommodation.entity.QAccommodation.accommodation;

@Repository
@RequiredArgsConstructor
public class AccommodationRepositoryImpl implements AccommodationRepositoryCustom {

    private final JPAQueryFactory queryFactory;


    @Override
    public List<Accommodation> findAccommodationsInMap(String minX, String maxX, String minY, String maxY) {
        return queryFactory
                .selectFrom(accommodation)
                .where(
                        accommodation.approvalStatus.eq(AccommodationStatus.APPROVED),
                        accommodation.mapX.between(minX, maxX),
                        accommodation.mapY.between(minY, maxY)
                )
                .fetch();


    }



}