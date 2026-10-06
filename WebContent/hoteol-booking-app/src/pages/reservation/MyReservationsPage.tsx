import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarX } from 'lucide-react';
import { Footer } from '../../components/common/Footer.tsx';
import { PageHeader} from "../../components/common/PageHeader.tsx";
import { MyReservationCard} from "../../components/reservation/MyReservationCard.tsx";
import { ReviewWriteModal} from "../../components/reservation/ReviewWriteModal.tsx";

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
    const [reviewTarget, setReviewTarget] = useState<MyReservationItem | null>(null);

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

    const getReservationCategory = (item: MyReservationItem): 'UPCOMING' | 'PAST' | 'CANCELED' => {
        if (item.status === 'CANCELED') return 'CANCELED';
        if (item.checkOutDate > todayStr) return 'UPCOMING';
        return 'PAST';
    };

    const counts = useMemo(() => {
        const result = { ALL: reservations.length, UPCOMING: 0, PAST: 0, CANCELED: 0 };
        reservations.forEach((r) => {
            const cat = getReservationCategory(r);
            result[cat]++;
        });
        return result;
    }, [reservations, todayStr]);

    const filteredList = useMemo(() => {
        if (activeTab === 'ALL') return reservations;
        return reservations.filter((r) => getReservationCategory(r) === activeTab);
    }, [reservations, activeTab, todayStr]);

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
            {/* 1. 공통 상단 헤더 */}
            <PageHeader title="예매한 숙소 조회" />

            <main className="container" style={{ maxWidth: '920px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>내 숙소 예약 내역</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        예약하신 제주 숙소의 일정과 상세 정보를 확인하고 관리할 수 있습니다.
                    </p>
                </div>

                {/* 2. 상단 필터 탭 */}
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

                {/* 3. 예약 리스트 렌더링 */}
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
                        {filteredList.map((item) => (
                            <MyReservationCard
                                key={item.reservationId}
                                item={item}
                                category={getReservationCategory(item)}
                                todayStr={todayStr}
                                canceling={cancelingId === item.reservationId}
                                onCancel={handleCancelReservation}
                                onOpenReview={(target) => setReviewTarget(target)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {/* 4. 분리된 리뷰 작성 모달 */}
            <ReviewWriteModal
                target={reviewTarget}
                onClose={() => setReviewTarget(null)}
                onSuccess={loadMyReservations}
            />
        </div>
    );
}