import { ArrowRight, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { money, getLodgingTypeName } from '../../data/stays.ts';
import type { useReservation } from '../../hooks/useReservation.ts';

type Reservation = ReturnType<typeof useReservation>;

export function BookingModal({ reservation }: { reservation: Reservation }) {
  const { selected, close } = reservation;
  const navigate = useNavigate();

  if (!selected) return null;

  const bgImage = selected.firstImage || selected.firstImage2 || '/jeju-stays.png';

  const handleGoDetail = () => {
    close();
    navigate(`/stays/${selected.contentId}`);
  };

  return (
      <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" style={{ maxWidth: '480px' }}>
          <button className="modal-close" onClick={close} aria-label="닫기">
            <X size={21} />
          </button>
          <div className="modal-image crop-0" style={{ backgroundImage: `url(${bgImage})`, height: '220px' }} />
          <div className="modal-body" style={{ padding: '24px' }}>
            <span className="eyebrow">JEJU STAY</span>
            <h2 id="booking-title" style={{ fontSize: '22px', margin: '4px 0 10px 0' }}>{selected.title}</h2>
            <p className="modal-address" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px' }}>
              <MapPin size={16} />
              {selected.addr} · {getLodgingTypeName(selected.lodgingType)}
            </p>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '14px 0' }}>
              {selected.overview ? `${selected.overview.slice(0, 110)}...` : '아늑하고 편안한 제주 숙소입니다.'}
            </p>
            <div className="modal-price" style={{ margin: '16px 0 20px 0', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              1박 최저가 <strong style={{ color: '#0f766e', fontSize: '18px', marginLeft: '6px' }}>{money(selected.basePrice)}</strong>
            </div>

            <button
                type="button"
                className="reserve-button"
                onClick={handleGoDetail}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#123f4d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
            >
              숙소 상세 및 객실 보러가기 <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
  );
}