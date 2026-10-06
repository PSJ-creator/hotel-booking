import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Building2,
    TrendingUp,
    CalendarCheck,
    CalendarX
} from 'lucide-react';
import { money } from '../../data/stays.ts';
import { Footer } from '../../components/common/Footer.tsx';
import { PageHeader} from "../../components/common/PageHeader.tsx";
import { HostReservationCard} from "../../components/host/HostReservationCard.tsx";

export interface HostReservationItem {
    reservationId: number;
    status: 'COMPLETED' | 'CANCELED' | string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    createdAt: string;

    guestId: number;
    guestName: string;
    guestEmail: string;

    contentId: string;
    stayTitle: string;
    firstImage: string;
    roomId: number;
    roomTitle: string;
    roomBaseCount: string;
    roomMaxCount: string;
}

type FilterTab = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELED';

export function HostReservationsPage() {
    const navigate = useNavigate();

    const [reservations, setReservations] = useState<HostReservationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
    const [selectedStayId, setSelectedStayId] = useState<string>('ALL');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [cancelingId, setCancelingId] = useState<number | null>(null);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const loadHostReservations = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 페이지입니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        axios.get<HostReservationItem[]>('/api/v1/reservations/host', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => setReservations(res.data))
            .catch((err) => {
                console.error('호스트 예약 내역 조회 실패:', err);
                alert('예약 관리 목록을 불러오지 못했습니다.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        loadHostReservations();
    }, []);

    const getCategory = (item: HostReservationItem): 'UPCOMING' | 'PAST' | 'CANCELED' => {
        if (item.status === 'CANCELED') return 'CANCELED';
        if (item.checkOutDate > todayStr) return 'UPCOMING';
        return 'PAST';
    };

    const stayOptions = useMemo(() => {
        const map = new Map<string, string>();
        reservations.forEach((r) => {
            if (!map.has(r.contentId)) map.set(r.contentId, r.stayTitle);
        });
        return Array.from(map.entries());
    }, [reservations]);

    const stats = useMemo(() => {
        let upcoming = 0;
        let past = 0;
        let canceled = 0;
        let totalRevenue = 0;

        reservations.forEach((r) => {
            const cat = getCategory(r);
            if (cat === 'UPCOMING') {
                upcoming++;
                totalRevenue += r.totalPrice || 0;
            } else if (cat === 'PAST') {
                past++;
                totalRevenue += r.totalPrice || 0;
            } else {
                canceled++;
            }
        });

        return {
            ALL: reservations.length,
            UPCOMING: upcoming,
            PAST: past,
            CANCELED: canceled,
            totalRevenue,
        };
    }, [reservations, todayStr]);

    const filteredList = useMemo(() => {
        return reservations.filter((item) => {
            if (activeTab !== 'ALL' && getCategory(item) !== activeTab) return false;
            if (selectedStayId !== 'ALL' && item.contentId !== selectedStayId) return false;
            if (searchKeyword.trim()) {
                const kw = searchKeyword.trim().toLowerCase();
                const matchGuest = item.guestName?.toLowerCase().includes(kw) || item.guestEmail?.toLowerCase().includes(kw);
                const matchRoom = item.roomTitle?.toLowerCase().includes(kw) || item.stayTitle?.toLowerCase().includes(kw);
                if (!matchGuest && !matchRoom) return false;
            }
            return true;
        });
    }, [reservations, activeTab, selectedStayId, searchKeyword, todayStr]);

    const handleHostCancel = async (item: HostReservationItem) => {
        const confirmCancel = window.confirm(
            `예약자 [${item.guestName}]님의 예약을 취소하시겠습니까?\n` +
            `· 숙소/객실: ${item.stayTitle} - ${item.roomTitle}\n` +
            `· 일정: ${item.checkInDate} ~ ${item.checkOutDate}\n\n` +
            `취소 시 되돌릴 수 없습니다.`
        );
        if (!confirmCancel) return;

        const token = localStorage.getItem('accessToken');
        setCancelingId(item.reservationId);

        try {
            await axios.patch(`/api/v1/reservations/${item.reservationId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('해당 예약이 취소 처리되었습니다.');
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
            <PageHeader
                title="파트너 예약 내역 관리"
                rightElement={
                    <span style={{
                        fontSize: '12px',
                        backgroundColor: '#e6f4ea',
                        color: '#137333',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 600
                    }}>
                        HOST 파트너 센터
                    </span>
                }
            />

            <main className="container" style={{ maxWidth: '980px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 2. 상단 요약 대시보드 카드 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>예정·진행 중 예약</span>
                            <CalendarCheck size={18} color="#0f766e" />
                        </div>
                        <strong style={{ fontSize: '24px', color: '#0f172a', fontWeight: 800 }}>{stats.UPCOMING}건</strong>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>전체 누적 예약</span>
                            <Building2 size={18} color="#123f4d" />
                        </div>
                        <strong style={{ fontSize: '24px', color: '#0f172a', fontWeight: 800 }}>{stats.ALL}건</strong>
                        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>(취소 {stats.CANCELED}건)</span>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>확정 예약 누적 매출</span>
                            <TrendingUp size={18} color="#0f766e" />
                        </div>
                        <strong style={{ fontSize: '24px', color: '#0f766e', fontWeight: 800 }}>{money(stats.totalRevenue)}</strong>
                    </div>
                </div>

                {/* 3. 필터 탭 & 숙소/예약자 검색 바 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '20px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                        {[
                            { key: 'ALL', label: '전체', count: stats.ALL },
                            { key: 'UPCOMING', label: '투숙 예정·진행', count: stats.UPCOMING },
                            { key: 'PAST', label: '이용 완료', count: stats.PAST },
                            { key: 'CANCELED', label: '취소됨', count: stats.CANCELED },
                        ].map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key as FilterTab)}
                                    style={{
                                        padding: '8px 15px',
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
                                        whiteSpace: 'nowrap'
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

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {stayOptions.length > 1 && (
                            <select
                                value={selectedStayId}
                                onChange={(e) => setSelectedStayId(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    fontSize: '13px',
                                    color: '#334155',
                                    fontWeight: 600,
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="ALL">모든 내 숙소 ({stayOptions.length})</option>
                                {stayOptions.map(([id, title]) => (
                                    <option key={id} value={id}>{title}</option>
                                ))}
                            </select>
                        )}

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="예약자명, 이메일, 객실 검색"
                                style={{
                                    padding: '8px 12px 8px 34px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    fontSize: '13px',
                                    width: '210px',
                                    outline: 'none'
                                }}
                            />
                            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
                        </div>
                    </div>
                </div>

                {/* 4. 예약 카드 리스트 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        접수된 예약 내역을 불러오는 중입니다...
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
                            조건에 해당하는 예약 내역이 없습니다.
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                            고객이 숙소를 예약하면 이곳에 실시간으로 표시됩니다.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredList.map((item) => (
                            <HostReservationCard
                                key={item.reservationId}
                                item={item}
                                category={getCategory(item)}
                                todayStr={todayStr}
                                canceling={cancelingId === item.reservationId}
                                onCancel={handleHostCancel}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}