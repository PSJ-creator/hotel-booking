// 차후 DB테이블 구현 후 바뀌어야함 @@

/** Spring API response: GET /api/stays */
export type Stay = {
  id: number;
  name: string;
  region: string;
  type: string;
  addressSido: string;
  address: string;
  basePrice: number;
  thumbnailUrl: string;
  imageUrls: string[];
  description: string;
  nearby: string;
};

/** Spring API request: POST /api/reservations */
export type Booking = {
  stayId: number;
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
