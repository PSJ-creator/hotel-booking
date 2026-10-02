/**
 * [테이블 5] ACCOMMODATION + JPA DTO 응답 규격
 */
export type  Stay= {
  contentId: string;       // PK, 식별자 (기존 id 대신 사용)
  memberId?: number | null;
  title: string;           // 숙소명 (기존 name 대신 사용)
  lodgingType?: string;    // AC01 ~ AC06 코드 또는 숙박 유형
  tel?: string;
  zipcode?: string;
  addr?: string;           // 기본 주소 (기존 address 대신 사용)
  checkinTime?: string;
  checkoutTime?: string;
  roomCount?: string;
  roomType?: string;
  parking?: string;
  subFacility?: string;
  overview?: string;       // 숙소 개요
  firstImage?: string;     // 대표 이미지 URL
  firstImage2?: string;    // 서브 썸네일 URL
  mapX?: string;
  mapY?: string;
  basePrice: number;       // 객실 최저가 (원화)
  remainingRooms?: number; // 잔여 객실 수
};

export type Room = {
  roomId: number;
  contentId: string;
  roomTitle?: string;
  roomSize?: string;
  roomBaseCount?: string;
  roomMaxCount?: string;
  pricePerNight?: number;
};

export type Booking = {
  contentId: string;
  roomId?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  phone: string;
};

export type BookingResponse = {
  reservationCode?: string;
  id?: number;
  status?: string;
  message?: string;
};