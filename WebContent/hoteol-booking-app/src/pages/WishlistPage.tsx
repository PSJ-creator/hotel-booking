import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, ArrowRight, Calendar, Users, RotateCcw } from 'lucide-react';
import { fetchMyWishlist, toggleAccommodationLike } from '../api/stays';
import { Footer } from '../components/Footer';
import { StayCard } from '../components/StayCard'; // 💡 공통 카드 컴포넌트 임포트
import type { Stay } from '../types/stay';

export function WishlistPage() {
    const navigate = useNavigate();

    // 오늘 날짜 문자열
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // 초기값은 빈 문자열로 두어 첫 진입 시 '전체 찜 목록'이 그대로 노출됨
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);

    const [wishlist, setWishlist] = useState<Stay[]>([]);
    const [loading, setLoading] = useState(true);

    // 삭제 애니메이션용 ID Set
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    // 숙소 목록 불러오기 (날짜 및 인원 조건 선택적 반영)
    const loadWishlist = (targetIn?: string, targetOut?: string, targetGuests?: number) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 페이지입니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        fetchMyWishlist(targetIn, targetOut, targetGuests)
            .then(data => setWishlist(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    // 최초 마운트 시 전체 조회
    useEffect(() => {
        loadWishlist('', '', undefined);
    }, []);

    // 검색 버튼 클릭 시 선택된 날짜 및 인원 전달
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadWishlist(checkIn, checkOut, guests);
    };

    // 필터 초기화
    const handleResetFilter = () => {
        setCheckIn('');
        setCheckOut('');
        setGuests(2);
        loadWishlist('', '', undefined);
    };

    // 찜 취소 핸들러 (애니메이션 유지)
    const handleRemoveLike = async (e: React.MouseEvent, contentId: string) => {
        e.stopPropagation();
        if (removingIds.has(contentId)) return;

        try {
            await toggleAccommodationLike(contentId);
            setRemovingIds(prev => new Set(prev).add(contentId));

            setTimeout(() => {
                setWishlist(prev => prev.filter(item => item.contentId !== contentId));
                setRemovingIds(prev => {
                    const next = new Set(prev);
                    next.delete(contentId);
                    return next;
                });
            }, 350);
        } catch {
            alert('위시리스트 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 상단 네비게이션 헤더 */}
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>숙소 위시리스트</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '1000px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 1. 페이지 헤더 타이틀 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>내가 찜한 제주 숙소</h1>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            {checkIn && checkOut
                                ? `${checkIn} ~ ${checkOut} 일정에 예약 가능한 찜한 숙소 목록입니다.`
                                : '찜해둔 숙소를 한눈에 비교하고 언제든 예약해 보세요.'}
                        </p>
                    </div>
                    {(checkIn || checkOut) && (
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                color: '#475569',
                                cursor: 'pointer',
                            }}
                        >
                            <RotateCcw size={13} /> 필터 초기화
                        </button>
                    )}
                </div>

                {/* 2. 일정 & 인원 검색 패널 */}
                <form
                    onSubmit={handleSearch}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 18px',
                        marginBottom: '28px',
                        gap: '0',
                    }}
                >
                    <div style={{ minWidth: '150px', paddingRight: '14px', borderRight: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700, display: 'block' }}>찜한 숙소 모아보기</span>
                        <strong style={{ fontSize: '15px', color: '#17343d', letterSpacing: '-0.3px' }}>일정으로 찾기</strong>
                    </div>

                    <div style={{ flex: '1.4', minWidth: '250px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={19} color="#49717a" style={{ flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <span style={{ fontSize: '11px', color: '#819296', fontWeight: 600 }}>일정</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <input
                                    type="date"
                                    min={todayStr}
                                    value={checkIn}
                                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                    onChange={(e) => {
                                        setCheckIn(e.target.value);
                                        if (e.target.value >= checkOut) {
                                            const nextD = new Date(e.target.value);
                                            nextD.setDate(nextD.getDate() + 1);
                                            setCheckOut(nextD.toISOString().split('T')[0]);
                                        }
                                    }}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: '#17343d',
                                        padding: 0,
                                        cursor: 'pointer',
                                        flex: 1,
                                    }}
                                />
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>~</span>
                                <input
                                    type="date"
                                    min={checkIn || todayStr}
                                    value={checkOut}
                                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: '#17343d',
                                        padding: 0,
                                        cursor: 'pointer',
                                        flex: 1,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: '0.8', minWidth: '120px', padding: '0 16px', borderLeft: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={19} color="#49717a" style={{ flexShrink: 0 }} />
                        <div style={{ width: '100%' }}>
                            <span style={{ fontSize: '11px', color: '#819296', fontWeight: 600, display: 'block' }}>인원</span>
                            <select
                                value={guests}
                                onChange={(e) => setGuests(Number(e.target.value))}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#17343d',
                                    cursor: 'pointer',
                                    width: '100%',
                                    padding: '2px 0 0 0',
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <option key={num} value={num}>성인 {num}명</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#123f4d',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '13px 22px',
                            fontSize: '14px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            marginLeft: '8px',
                        }}
                    >
                        일정 검색 <ArrowRight size={16} />
                    </button>
                </form>

                {/* 3. 숙소 그리드 목록 (공통 StayCard 사용) */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>목록을 불러오는 중입니다...</div>
                ) : wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <Heart size={44} color="#cbd5e1" style={{ marginBottom: '14px' }} />
                        <h3 style={{ fontSize: '16px', color: '#475569', margin: '0 0 8px 0' }}>
                            {checkIn && checkOut ? '해당 일정에 예약 가능한 찜한 숙소가 없습니다.' : '위시리스트가 비어 있습니다.'}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
                            {checkIn && checkOut ? '다른 날짜를 선택하시거나 필터를 초기화해 보세요.' : '마음에 드는 숙소를 찜해 두면 이곳에서 모아볼 수 있습니다.'}
                        </p>
                        {checkIn && checkOut ? (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                style={{ padding: '10px 22px', backgroundColor: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                전체 찜 목록 보기
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                style={{ padding: '10px 22px', backgroundColor: '#123f4d', color: '#ffffff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                숙소 둘러보기
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="stay-grid">
                        {wishlist.map((s) => (
                            <StayCard
                                key={s.contentId}
                                stay={s}
                                isLiked={true}
                                isRemoving={removingIds.has(s.contentId)}
                                onCardClick={(stay) =>
                                    navigate(`/stays/${stay.contentId}`, {
                                        state: {
                                            checkIn: checkIn || '',
                                            checkOut: checkOut || '',
                                        },
                                    })
                                }
                                onToggleLike={handleRemoveLike}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}