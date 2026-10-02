import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft,
    Calendar,
    BedDouble,
    User,
    Mail,
    Search,
    XCircle,
    Building2,
    TrendingUp,
    CalendarCheck,
    CalendarX
} from 'lucide-react';
import { money } from '../data/stays';
import { Footer } from '../components/Footer';

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

    // 예약 상태 분류: CANCELED(취소됨) / UPCOMING(체크인 예정 또는 투숙 중) / PAST(체크아웃 완료)
    const getCategory = (item: HostReservationItem): 'UPCOMING' | 'PAST' | 'CANCELED' => {
        if (item.status === 'CANCELED') return 'CANCELED';
        if (item.checkOutDate > todayStr) return 'UPCOMING';
        return 'PAST';
    };

    // 호스트가 보유한 숙소 목록 추출 (숙소별 필터 드롭다운용)
    const stayOptions = useMemo(() => {
        const map = new Map<string, string>();
        reservations.forEach((r) => {
            if (!map.has(r.contentId)) {
                map.set(r.contentId, r.stayTitle);
            }
        });
        return Array.from(map.entries());
    }, [reservations]);

    // 대시보드 통계 및 탭별 카운트 계산
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

    // 탭 + 숙소 선택 + 예약자 검색 필터링
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

    // 박수 계산
    const getNights = (checkIn: string, checkOut: string) => {
        const s = new Date(checkIn);
        const e = new Date(checkOut);
        const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    // 체크인 D-Day 뱃지
    const getDDayLabel = (checkIn: string) => {
        const today = new Date(todayStr);
        const target = new Date(checkIn);
        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return '오늘 체크인';
        if (diff > 0) return `D-${diff}`;
        return '현재 투숙 중';
    };

    // 호스트 예약 직권 취소 핸들러
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
            {/* 상단 네비게이션 헤더 */}
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <ChevronLeft size={24} color="#123f4d" />
                        </button>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>파트너 예약 내역 관리</span>
                    </div>
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
                </div>
            </header>

            <main className="container" style={{ maxWidth: '980px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 1. 상단 요약 대시보드 카드 */}
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

                {/* 2. 필터 탭 & 숙소/예약자 검색 바 */}
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
                    {/* 좌측 상태 탭 */}
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

                    {/* 우측 숙소 필터 & 예약자명 검색 */}
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

                {/* 3. 예약 카드 리스트 */}
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
                        {filteredList.map((item) => {
                            const category = getCategory(item);
                            const nights = getNights(item.checkInDate, item.checkOutDate);
                            const createdDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '.') : '';
                            const orderNo = `#${item.checkInDate.replace(/-/g, '')}-${String(item.reservationId).padStart(4, '0')}`;

                            return (
                                <article
                                    key={item.reservationId}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                        opacity: category === 'CANCELED' ? 0.72 : 1
                                    }}
                                >
                                    {/* 상단 바: 예약번호 + 접수일 + 상태 뱃지 */}
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

                                    {/* 중단 본문: 좌측(숙소/객실 정보) + 우측(예약자 게스트 정보 박스) */}
                                    <div style={{
                                        padding: '20px 22px',
                                        display: 'grid',
                                        gridTemplateColumns: '140px 1.3fr 1fr',
                                        gap: '20px',
                                        alignItems: 'center'
                                    }}>
                                        {/* 숙소 썸네일 */}
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

                                        {/* 숙소명 & 객실명 & 투숙 일정 */}
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

                                    {/* 하단 바: 결제 금액 + 호스트 예약 취소 버튼 */}
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
                                                    disabled={cancelingId === item.reservationId}
                                                    onClick={() => handleHostCancel(item)}
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
                                                    {cancelingId === item.reservationId ? '취소 처리 중...' : '예약 취소 처리'}
                                                </button>
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