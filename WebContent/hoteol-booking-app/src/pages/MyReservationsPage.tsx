import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft,
    Calendar,
    MapPin,
    Phone,
    Copy,
    BedDouble,
    Clock,
    XCircle,
    MessageSquarePlus,
    CheckCircle2,
    CalendarX
} from 'lucide-react';
import { money, getLodgingTypeName } from '../data/stays';
import { Footer } from '../components/Footer';

export interface MyReservationItem {
    reservationId: number;
    status: 'COMPLETED' | 'CANCELED' | string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    createdAt: string;

    contentId: string;
    stayTitle: string;
    lodgingType: string;
    addr: string;
    tel: string;
    firstImage: string;
    checkinTime: string;
    checkoutTime: string;

    roomId: number;
    roomTitle: string;
    roomBaseCount: string;
    roomMaxCount: string;

    hasReview: boolean;
}

type FilterTab = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELED';

export function MyReservationsPage() {
    const navigate = useNavigate();

    const [reservations, setReservations] = useState<MyReservationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
    const [cancelingId, setCancelingId] = useState<number | null>(null);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const loadMyReservations = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 페이지입니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        axios.get<MyReservationItem[]>('/api/v1/reservations/my', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => setReservations(res.data))
            .catch((err) => {
                console.error('예약 내역 조회 실패:', err);
                alert('예약 내역을 불러오지 못했습니다.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        loadMyReservations();
    }, []);

    // 예약 상태 분류 헬퍼: CANCELED(취소됨) / UPCOMING(이용 예정) / PAST(이용 완료)
    const getReservationCategory = (item: MyReservationItem): 'UPCOMING' | 'PAST' | 'CANCELED' => {
        if (item.status === 'CANCELED') return 'CANCELED';
        if (item.checkOutDate > todayStr) return 'UPCOMING';
        return 'PAST';
    };

    // 탭별 카운트 계산
    const counts = useMemo(() => {
        const result = { ALL: reservations.length, UPCOMING: 0, PAST: 0, CANCELED: 0 };
        reservations.forEach((r) => {
            const cat = getReservationCategory(r);
            result[cat]++;
        });
        return result;
    }, [reservations, todayStr]);

    // 현재 선택된 탭에 맞는 목록 필터링
    const filteredList = useMemo(() => {
        if (activeTab === 'ALL') return reservations;
        return reservations.filter((r) => getReservationCategory(r) === activeTab);
    }, [reservations, activeTab, todayStr]);

    // 박수 계산 헬퍼
    const getNights = (checkIn: string, checkOut: string) => {
        const s = new Date(checkIn);
        const e = new Date(checkOut);
        const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    // 디데이(D-Day) 계산 헬퍼
    const getDDayBadge = (checkIn: string) => {
        const today = new Date(todayStr);
        const target = new Date(checkIn);
        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return '오늘 체크인';
        if (diff > 0) return `D-${diff}`;
        return '투숙 중';
    };

    // 주소 복사 핸들러
    const handleCopyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr);
        alert('숙소 주소가 클립보드에 복사되었습니다.');
    };

    // 예약 취소 핸들러
    const handleCancelReservation = async (item: MyReservationItem) => {
        const confirmCancel = window.confirm(
            `[${item.stayTitle} - ${item.roomTitle}]\n정말 예약을 취소하시겠습니까? 취소 시 객실 재고가 즉시 복구됩니다.`
        );
        if (!confirmCancel) return;

        const token = localStorage.getItem('accessToken');
        setCancelingId(item.reservationId);

        try {
            await axios.patch(`/api/v1/reservations/${item.reservationId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('예약이 정상적으로 취소되었습니다.');
            // 상태 즉시 업데이트
            setReservations((prev) =>
                prev.map((r) =>
                    r.reservationId === item.reservationId ? { ...r, status: 'CANCELED' } : r
                )
            );
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || '예약 취소 처리 중 오류가 발생했습니다.');
        } finally {
            setCancelingId(null);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 상단 고정 헤더 */}
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>예매한 숙소 조회</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '920px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>내 숙소 예약 내역</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        예약하신 제주 숙소의 일정과 상세 정보를 확인하고 관리할 수 있습니다.
                    </p>
                </div>

                {/* 상단 필터 탭 */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '12px',
                    overflowX: 'auto'
                }}>
                    {[
                        { key: 'ALL', label: '전체 내역', count: counts.ALL },
                        { key: 'UPCOMING', label: '이용 예정', count: counts.UPCOMING },
                        { key: 'PAST', label: '이용 완료', count: counts.PAST },
                        { key: 'CANCELED', label: '취소됨', count: counts.CANCELED },
                    ].map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key as FilterTab)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: isActive ? '1px solid #123f4d' : '1px solid #cbd5e1',
                                    backgroundColor: isActive ? '#123f4d' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#475569',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <span>{tab.label}</span>
                                <span style={{
                                    padding: '1px 7px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                    color: isActive ? '#ffffff' : '#64748b'
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 예약 리스트 렌더링 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        예약 내역을 불러오는 중입니다...
                    </div>
                ) : filteredList.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <CalendarX size={44} color="#cbd5e1" style={{ marginBottom: '14px' }} />
                        <h3 style={{ fontSize: '16px', color: '#475569', margin: '0 0 8px 0' }}>
                            해당하는 예약 내역이 없습니다.
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
                            마음에 드는 제주 숙소를 찾아 새로운 여행을 계획해 보세요.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            style={{
                                padding: '10px 22px',
                                backgroundColor: '#123f4d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '24px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            숙소 둘러보기
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {filteredList.map((item) => {
                            const category = getReservationCategory(item);
                            const nights = getNights(item.checkInDate, item.checkOutDate);
                            const formattedDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '.') : '';
                            const orderNo = `#${item.checkInDate.replace(/-/g, '')}-${String(item.reservationId).padStart(4, '0')}`;

                            return (
                                <article
                                    key={item.reservationId}
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

                                    {/* 3. 하단 요약 바: 체크인/체크아웃 일정 + 총 결제 금액 + 액션 버튼 */}
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

                                            {/* 조건부 액션 버튼 */}
                                            {category === 'UPCOMING' && (
                                                <button
                                                    type="button"
                                                    disabled={cancelingId === item.reservationId}
                                                    onClick={() => handleCancelReservation(item)}
                                                    style={{
                                                        padding: '9px 16px',
                                                        backgroundColor: '#fff1f2',
                                                        color: '#e11d48',
                                                        border: '1px solid #fecdd3',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        cursor: cancelingId === item.reservationId ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    <XCircle size={15} />
                                                    {cancelingId === item.reservationId ? '취소 처리 중...' : '예약 취소'}
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
                                                        onClick={() => alert('리뷰 작성 모달은 다음 단계에서 연결할 수 있습니다.')}
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
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}