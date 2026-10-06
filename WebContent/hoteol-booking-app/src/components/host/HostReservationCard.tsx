import { useNavigate } from 'react-router-dom';
import { Calendar, BedDouble, User, Mail, XCircle } from 'lucide-react';
import { money } from '../../data/stays.ts'
import type { HostReservationItem} from "../../pages/host/HostReservationsPage.tsx";

interface HostReservationCardProps {
    item: HostReservationItem;
    category: 'UPCOMING' | 'PAST' | 'CANCELED';
    todayStr: string;
    canceling: boolean;
    onCancel: (item: HostReservationItem) => void;
}

export function HostReservationCard({
                                        item,
                                        category,
                                        todayStr,
                                        canceling,
                                        onCancel
                                    }: HostReservationCardProps) {
    const navigate = useNavigate();

    const getNights = (checkIn: string, checkOut: string) => {
        const s = new Date(checkIn);
        const e = new Date(checkOut);
        const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    const getDDayLabel = (checkIn: string) => {
        const today = new Date(todayStr);
        const target = new Date(checkIn);
        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return '오늘 체크인';
        if (diff > 0) return `D-${diff}`;
        return '현재 투숙 중';
    };

    const nights = getNights(item.checkInDate, item.checkOutDate);
    const createdDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '.') : '';
    const orderNo = `#${item.checkInDate.replace(/-/g, '')}-${String(item.reservationId).padStart(4, '0')}`;

    return (
        <article
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                opacity: category === 'CANCELED' ? 0.72 : 1
            }}
        >
            {/* 1. 상단 바: 예약번호 + 접수일 + 상태 뱃지 */}
            <div style={{
                padding: '12px 22px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <strong style={{ color: '#0f172a' }}>예약번호 {orderNo}</strong>
                    {createdDate && (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                            · {createdDate} 접수
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {category === 'UPCOMING' && (
                        <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: '#123f4d',
                            color: '#ffffff'
                        }}>
                            {getDDayLabel(item.checkInDate)}
                        </span>
                    )}
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor:
                            category === 'UPCOMING'
                                ? '#ccfbf1'
                                : category === 'PAST'
                                    ? '#f1f5f9'
                                    : '#fee2e2',
                        color:
                            category === 'UPCOMING'
                                ? '#0f766e'
                                : category === 'PAST'
                                    ? '#475569'
                                    : '#dc2626'
                    }}>
                        {category === 'UPCOMING' && '예약 확정'}
                        {category === 'PAST' && '투숙 완료'}
                        {category === 'CANCELED' && '취소됨'}
                    </span>
                </div>
            </div>

            {/* 2. 중단 본문: 숙소/객실 정보 + 예약자 게스트 정보 박스 */}
            <div style={{
                padding: '20px 22px',
                display: 'grid',
                gridTemplateColumns: '140px 1.3fr 1fr',
                gap: '20px',
                alignItems: 'center'
            }}>
                <div
                    onClick={() => navigate(`/stays/${item.contentId}`)}
                    style={{
                        width: '140px',
                        height: '100px',
                        borderRadius: '10px',
                        backgroundImage: `url(${item.firstImage || '/jeju-stays.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0'
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <strong
                        onClick={() => navigate(`/stays/${item.contentId}`)}
                        style={{ fontSize: '17px', color: '#0f172a', cursor: 'pointer' }}
                    >
                        {item.stayTitle}
                    </strong>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#0f766e' }}>
                        <BedDouble size={15} />
                        <span>{item.roomTitle}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>
                            (기준 {item.roomBaseCount || '2'}인 / 최대 {item.roomMaxCount || '4'}인)
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                        <Calendar size={14} color="#64748b" />
                        <strong>{item.checkInDate}</strong>
                        <span>~</span>
                        <strong>{item.checkOutDate}</strong>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#0f766e',
                            backgroundColor: '#f0fdfa',
                            padding: '2px 8px',
                            borderRadius: '8px'
                        }}>
                            {nights}박
                        </span>
                    </div>
                </div>

                {/* 예약자(고객) 정보 박스 */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                        예약 고객 정보
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        <User size={14} color="#0f766e" />
                        <span>{item.guestName} 님</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                        <Mail size={13} color="#94a3b8" />
                        <span>{item.guestEmail}</span>
                    </div>
                </div>
            </div>

            {/* 3. 하단 바: 결제 금액 + 호스트 예약 취소 버튼 */}
            <div style={{
                padding: '14px 22px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#fcfdfe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {category === 'CANCELED'
                        ? '취소 완료된 예약입니다'
                        : category === 'PAST'
                            ? '투숙이 끝난 예약입니다'
                            : '진행 예정인 예약입니다'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>결제 금액</span>
                        <strong style={{
                            fontSize: '18px',
                            color: category === 'CANCELED' ? '#94a3b8' : '#0f766e',
                            textDecoration: category === 'CANCELED' ? 'line-through' : 'none'
                        }}>
                            {money(item.totalPrice)}
                        </strong>
                    </div>

                    {category === 'UPCOMING' && (
                        <button
                            type="button"
                            disabled={canceling}
                            onClick={() => onCancel(item)}
                            style={{
                                padding: '9px 16px',
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: canceling ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <XCircle size={15} />
                            {canceling ? '취소 처리 중...' : '예약 취소 처리'}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}