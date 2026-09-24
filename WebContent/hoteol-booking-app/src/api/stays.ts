import type { Booking, BookingResponse, Stay } from '../types/stay';

const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function fetchStays(): Promise<Stay[]> {
  const response = await fetch(`${apiBase}/api/stays`);
  if (!response.ok) throw new Error('숙소 정보를 불러오지 못했습니다.');
  const stays: unknown = await response.json();
  if (!Array.isArray(stays)) throw new Error('숙소 응답 형식이 올바르지 않습니다.');
  return stays as Stay[];
}

export async function createReservation(booking: Booking): Promise<BookingResponse> {
  const response = await fetch(`${apiBase}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  const data: BookingResponse = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || '예약 요청을 처리하지 못했습니다.');
  return data;
}
