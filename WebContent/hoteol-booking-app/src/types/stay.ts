/**
 * [테이블 5] ACCOMMODATION + JPA DTO 응답 규격
 */
export type  Stay= {
  contentId: string;
  memberId?: number | null;
  title: string;
  lodgingType?: string;
  tel?: string;
  zipcode?: string;
  addr?: string;
  checkinTime?: string;
  checkoutTime?: string;
  roomCount?: string;
  roomType?: string;
  parking?: string;
  subFacility?: string;
  overview?: string;
  firstImage?: string;
  firstImage2?: string;
  mapX?: string;
  mapY?: string;
  basePrice: number;
  remainingRooms?: number;
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