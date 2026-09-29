package org.example.hotelbooking.domain.accommodation.dto;

import lombok.Getter;

public class AccommodationDto {

    @Getter
    public static class RegisterRequest {
        private String contentId;
        private String title;
        private String lodgingType;
        private String tel;
        private String zipcode;
        private String addr;
        private String checkinTime;
        private String checkoutTime;
        private String roomCount;
        private String roomType;
        private String parking;
        private String subFacility;
        private String overview;
    }
}