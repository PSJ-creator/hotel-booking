import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, RotateCcw } from 'lucide-react';
import { fetchMyWishlist, toggleAccommodationLike } from '../../api/stays.ts';
import { Footer } from '../../components/common/Footer.tsx';
import { StayCard } from '../../components/stay/StayCard.tsx';
import { PageHeader} from "../../components/common/PageHeader.tsx";
import { WishlistDateFilterBar} from "../../components/stay/WishlistDateFilterBar.tsx";
import type { Stay } from '../../types/stay.ts';

export function WishlistPage() {
    const navigate = useNavigate();

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);

    const [wishlist, setWishlist] = useState<Stay[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    const loadWishlist = (targetIn?: string, targetOut?: string, targetGuests?: number) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 페이지입니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        fetchMyWishlist(targetIn, targetOut, targetGuests)
            .then((data) => setWishlist(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadWishlist('', '', undefined);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadWishlist(checkIn, checkOut, guests);
    };

    const handleResetFilter = () => {
        setCheckIn('');
        setCheckOut('');
        setGuests(2);
        loadWishlist('', '', undefined);
    };

    const handleRemoveLike = async (e: React.MouseEvent, contentId: string) => {
        e.stopPropagation();
        if (removingIds.has(contentId)) return;

        try {
            await toggleAccommodationLike(contentId);
            setRemovingIds((prev) => new Set(prev).add(contentId));

            setTimeout(() => {
                setWishlist((prev) => prev.filter((item) => item.contentId !== contentId));
                setRemovingIds((prev) => {
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
            {/* 1. 공통 상단 헤더 */}
            <PageHeader title="숙소 위시리스트" />

            <main className="container" style={{ maxWidth: '1000px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 2. 페이지 헤더 타이틀 */}
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

                {/* 3. 분리된 일정 & 인원 검색 패널 */}
                <WishlistDateFilterBar
                    todayStr={todayStr}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    onCheckInChange={setCheckIn}
                    onCheckOutChange={setCheckOut}
                    onGuestsChange={setGuests}
                    onSearch={handleSearch}
                />

                {/* 4. 숙소 그리드 목록 */}
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