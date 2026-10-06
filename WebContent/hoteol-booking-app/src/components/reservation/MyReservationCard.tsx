import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Phone,
    Copy,
    BedDouble,
    Clock,
    XCircle,
    MessageSquarePlus,
    CheckCircle2
} from 'lucide-react';
import { money, getLodgingTypeName } from '../../data/stays.ts'
import type { MyReservationItem} from "../../pages/reservation/MyReservationsPage.tsx";

interface MyReservationCardProps {
    item: MyReservationItem;
    category: 'UPCOMING' | 'PAST' | 'CANCELED';
    todayStr: string;
    canceling: boolean;
    onCancel: (item: MyReservationItem) => void;
    onOpenReview: (item: MyReservationItem) => void;
}

export function MyReservationCard({
                                      item,
                                      category,
                                      todayStr,
                                      canceling,
                                      onCancel,
                                      onOpenReview
                                  }: MyReservationCardProps) {
    const navigate = useNavigate();

    const getNights = (checkIn: string, checkOut: string) => {
        const s = new Date(checkIn);
        const e = new Date(checkOut);
        const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    const getDDayBadge = (checkIn: string) => {
        const today = new Date(todayStr);
        const target = new Date(checkIn);
        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return '오늘 체크인';
        if (diff > 0) return `D-${diff}`;
        return '투숙 중';
    };

    const handleCopyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr);
        alert('숙소 주소가 클립보드에 복사되었습니다.');
    };

    const nights = getNights(item.checkInDate, item.checkOutDate);
    const formattedDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '.') : '';
    const orderNo = `#${item.checkInDate.replace(/-/g, '')}-${String(item.reservationId).padStart(4, '0')}`;

    return (
        <article
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                opacity: category === 'CANCELED' ? 0.75 : 1
            }}
        >
            {/* 1. 상단 헤더: 예약번호 + 예약일시 + 상태 뱃지 */}
            <div style={{
                padding: '14px 22px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <strong style={{ color: '#0f172a', fontWeight: 700 }}>예약번호 {orderNo}</strong>
                    {formattedDate && (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                            · {formattedDate} 결제
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
                            {getDDayBadge(item.checkInDate)}
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
                        {category === 'PAST' && '이용 완료'}
                        {category === 'CANCELED' && '예약 취소됨'}
                    </span>
                </div>
            </div>

            {/* 2. 중단 본문: 숙소 대표 이미지 + 숙소/객실 상세 정보 */}
            <div style={{
                padding: '20px 22px',
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: '20px',
                alignItems: 'center'
            }}>
                <div
                    onClick={() => navigate(`/stays/${item.contentId}`)}
                    style={{
                        width: '160px',
                        height: '120px',
                        borderRadius: '12px',
                        backgroundImage: `url(${item.firstImage || '/jeju-stays.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0'
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#0f766e',
                            backgroundColor: '#f0fdfa',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #ccfbf1'
                        }}>
                            {getLodgingTypeName(item.lodgingType)}
                        </span>
                    </div>

                    <h3
                        onClick={() => navigate(`/stays/${item.contentId}`)}
                        style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: 0,
                            cursor: 'pointer',
                            display: 'inline-block'
                        }}
                    >
                        {item.stayTitle}
                    </h3>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#334155',
                        marginTop: '2px'
                    }}>
                        <BedDouble size={15} color="#0f766e" />
                        <span>{item.roomTitle}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>
                            (기준 {item.roomBaseCount || '2'}인 / 최대 {item.roomMaxCount || '4'}인)
                        </span>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '4px'
                    }}>
                        {item.addr && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={13} /> {item.addr}
                                <button
                                    type="button"
                                    onClick={() => handleCopyAddress(item.addr)}
                                    style={{
                                        marginLeft: '4px',
                                        padding: '2px 6px',
                                        fontSize: '11px',
                                        backgroundColor: '#f1f5f9',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        color: '#475569',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Copy size={10} /> 복사
                                </button>
                            </span>
                        )}

                        {item.tel && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={13} /> {item.tel}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. 하단 요약 바: 일정 + 총 결제 금액 + 조건부 액션 버튼 */}
            <div style={{
                padding: '16px 22px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#fcfdfe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#1e293b' }}>
                        <Calendar size={15} color="#0f766e" />
                        <strong>{item.checkInDate}</strong>
                        <span style={{ color: '#94a3b8' }}>~</span>
                        <strong>{item.checkOutDate}</strong>
                        <span style={{
                            fontSize: '12px',
                            color: '#0f766e',
                            fontWeight: 700,
                            backgroundColor: '#f0fdfa',
                            padding: '2px 8px',
                            borderRadius: '10px'
                        }}>
                            {nights}박
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                        <Clock size={14} />
                        <span>
                            체크인 {item.checkinTime || '15:00'} / 체크아웃 {item.checkoutTime || '11:00'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                            총 결제 금액
                        </span>
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
                            {canceling ? '취소 처리 중...' : '예약 취소'}
                        </button>
                    )}

                    {category === 'PAST' && (
                        item.hasReview ? (
                            <button
                                type="button"
                                disabled
                                style={{
                                    padding: '9px 16px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#94a3b8',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    cursor: 'default'
                                }}
                            >
                                <CheckCircle2 size={15} /> 리뷰 작성 완료
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onOpenReview(item)}
                                style={{
                                    padding: '9px 16px',
                                    backgroundColor: '#123f4d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <MessageSquarePlus size={15} /> 리뷰 작성하기
                            </button>
                        )
                    )}
                </div>
            </div>
        </article>
    );
}