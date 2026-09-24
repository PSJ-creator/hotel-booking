import { ArrowRight, CalendarDays, MapPin, Users, X } from 'lucide-react';
import { money } from '../data/stays';
import type { useReservation } from '../hooks/useReservation';

type Reservation = ReturnType<typeof useReservation>;

export function BookingModal({ reservation }: { reservation: Reservation }) {
  const { selected, close, book, checkIn, setCheckIn, checkOut, setCheckOut,
    guests, setGuests, guestName, setGuestName, phone, setPhone, submitting, feedback } = reservation;
  if (!selected) return null;
  return (
<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="modal-close" onClick={close} aria-label="닫기"><X size={21}/></button><div className="modal-image crop-0" style={{backgroundImage:`url(${selected.thumbnailUrl})`}}/><div className="modal-body"><span className="eyebrow">JEJU STAY</span><h2 id="booking-title">{selected.name}</h2><p className="modal-address"><MapPin size={16}/>{selected.addressSido} {selected.address} · {selected.type}</p><p>{selected.description} · {selected.nearby} 근처</p><div className="modal-price">1박 기준가 <strong>{money(selected.basePrice)}</strong><small> 날짜별 실제 요금은 예약 단계에서 확인</small></div><form onSubmit={book}><div className="form-grid"><label><CalendarDays size={16}/> 입실일<input type="date" required min={new Date().toISOString().slice(0,10)} value={checkIn} onChange={e=>setCheckIn(e.target.value)}/></label><label><CalendarDays size={16}/> 퇴실일<input type="date" required min={checkIn||new Date().toISOString().slice(0,10)} value={checkOut} onChange={e=>setCheckOut(e.target.value)}/></label><label><Users size={16}/> 인원<input type="number" required min="1" max="20" value={guests} onChange={e=>setGuests(Number(e.target.value))}/></label><label>예약자 이름<input required maxLength={80} value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="이름"/></label><label className="wide">연락처<input required type="tel" pattern="[0-9+ -]{9,20}" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="010-0000-0000"/></label></div><button className="reserve-button" disabled={submitting}>{submitting?'접수 중...':'예약 요청하기'} <ArrowRight size={17}/></button>{feedback&&<p className="feedback" role="status">{feedback}</p>}</form></div></section></div>
  );
}
