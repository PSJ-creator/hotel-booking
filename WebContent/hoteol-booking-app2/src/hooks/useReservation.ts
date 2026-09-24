import { useEffect, useState, type FormEvent } from 'react';
import { createReservation } from '../api/stays';
import type { Booking, Stay } from '../types/stay';

export function useReservation(apiOnline: boolean) {
  const [selected, setSelected] = useState<Stay | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const open = (stay: Stay) => { setSelected(stay); setFeedback(''); };
  const close = () => { setSelected(null); setFeedback(''); };

  const book = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    if (checkOut <= checkIn) {
      setFeedback('퇴실일은 입실일 다음 날부터 선택해 주세요.');
      return;
    }
    if (!apiOnline) {
      setFeedback('현재 예약 접수를 준비 중입니다. 실제 숙소와 가격이 등록된 뒤 예약할 수 있습니다.');
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      const booking: Booking = { stayId: selected.id, checkIn, checkOut, guests, guestName, phone };
      const data = await createReservation(booking);
      setFeedback(`예약 요청이 접수되었습니다. 예약번호: ${data.reservationCode || data.id}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return { selected, open, close, checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests,
    guestName, setGuestName, phone, setPhone, submitting, feedback, book };
}
