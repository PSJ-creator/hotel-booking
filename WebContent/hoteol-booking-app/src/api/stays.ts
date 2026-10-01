import type { Booking, BookingResponse, Stay } from '../types/stay';

const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function fetchStays(): Promise<Stay[]> {
  const response = await fetch(`${apiBase}/api/v1/stays`);
  if (!response.ok) throw new Error('숙소 정보를 불러오지 못했습니다.');
  const stays: unknown = await response.json();
  if (!Array.isArray(stays)) throw new Error('숙소 응답 형식이 올바르지 않습니다.');
  return stays as Stay[];
}

export async function createReservation(booking: Booking): Promise<BookingResponse> {
  const response = await fetch(`${apiBase}/api/v1/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  const data: BookingResponse = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || '예약 요청을 처리하지 못했습니다.');
  return data;
}

export async function toggleAccommodationLike(contentId: string): Promise<{ liked: boolean; message: string }> {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${apiBase}/api/v1/likes/accommodations/${contentId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('위시리스트 처리 중 오류가 발생했습니다.');
  return response.json();
}

// 💡 내 위시리스트 숙소 목록 조회
export async function fetchMyWishlist(checkIn?: string, checkOut?: string, guests?: number): Promise<Stay[]> {
  const token = localStorage.getItem('accessToken');
  const params = new URLSearchParams();
  if (checkIn && checkIn.trim()) params.append('checkIn', checkIn.trim());
  if (checkOut && checkOut.trim()) params.append('checkOut', checkOut.trim());
  if (guests && guests > 0) params.append('guests', String(guests));

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${apiBase}/api/v1/likes/accommodations/my${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('위시리스트를 불러오지 못했습니다.');
  return response.json();
}
