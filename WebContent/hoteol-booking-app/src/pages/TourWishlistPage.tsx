import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Heart,
    MapPin,
    ArrowRight,
    Search,
    Clock,
    Phone,
    Map as MapIcon,
    Compass
} from 'lucide-react';
import { fetchMyTourWishlist, toggleTourLike, type TourSummary } from '../api/tours';
import { Footer } from '../components/Footer';
import { TourMapModal } from '../components/TourMapModal';

function cleanHtmlText(text?: string): string {
    if (!text) return '';
    return text
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<[^>]*>?/gm, '')
        .trim();
}

export function TourWishlistPage() {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState<TourSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // 지역 필터 ('ALL' | 'JEJU' | 'SEOGWIPO') 및 검색어 상태
    const [regionFilter, setRegionFilter] = useState<'ALL' | 'JEJU' | 'SEOGWIPO'>('ALL');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 삭제 애니메이션용 ID Set
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    // 위시리스트 지도 모달 오픈 상태
    const [isMapOpen, setIsMapOpen] = useState(false);

    const loadTourWishlist = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 페이지입니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        fetchMyTourWishlist()
            .then((data) => setWishlist(data))
            .catch((err) => {
                console.error('관광지 위시리스트 조회 실패:', err);
                alert('관광지 위시리스트를 불러오지 못했습니다.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        loadTourWishlist();
    }, []);

    // 지역 및 키워드 필터링된 목록
    const filteredList = useMemo(() => {
        return wishlist.filter((item) => {
            const addr = `${item.addr1 || ''} ${item.addr2 || ''}`;
            if (regionFilter === 'JEJU' && !addr.includes('제주시')) return false;
            if (regionFilter === 'SEOGWIPO' && !addr.includes('서귀포')) return false;

            if (searchKeyword.trim()) {
                const kw = searchKeyword.trim().toLowerCase();
                const matchTitle = item.title?.toLowerCase().includes(kw);
                const matchAddr = addr.toLowerCase().includes(kw);
                if (!matchTitle && !matchAddr) return false;
            }
            return true;
        });
    }, [wishlist, regionFilter, searchKeyword]);

    // 찜 해제 핸들러 (부드러운 제거 애니메이션 적용)
    const handleRemoveLike = async (e: React.MouseEvent, contentId: string) => {
        e.stopPropagation();
        if (removingIds.has(contentId)) return;

        try {
            await toggleTourLike(contentId);
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
            {/* 상단 네비게이션 헤더 */}
            <header style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <ChevronLeft size={24} color="#123f4d" />
                        </button>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>관광지 위시리스트</span>
                    </div>

                    {wishlist.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                backgroundColor: '#0f766e',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(15, 118, 110, 0.2)'
                            }}
                        >
                            <MapIcon size={14} /> 찜한 관광지 지도 보기 ({filteredList.length})
                        </button>
                    )}
                </div>
            </header>

            <main className="container" style={{ maxWidth: '1120px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 타이틀 및 필터 바 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                            MY JEJU ATTRACTIONS
                        </span>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                            내가 찜한 제주 명소 <span style={{ color: '#0f766e' }}>{wishlist.length}</span>
                        </h1>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            저장해 둔 관광지를 확인하고 나만의 제주 여행 동선을 계획해 보세요.
                        </p>
                    </div>

                    {/* 지역 칩 & 검색창 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {[
                                { key: 'ALL', label: '전체' },
                                { key: 'JEJU', label: '제주시' },
                                { key: 'SEOGWIPO', label: '서귀포시' },
                            ].map((tab) => {
                                const active = regionFilter === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setRegionFilter(tab.key as 'ALL' | 'JEJU' | 'SEOGWIPO')}
                                        style={{
                                            padding: '7px 14px',
                                            borderRadius: '20px',
                                            border: active ? '1px solid #123f4d' : '1px solid #cbd5e1',
                                            backgroundColor: active ? '#123f4d' : '#ffffff',
                                            color: active ? '#ffffff' : '#475569',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="관광지명 또는 주소 검색"
                                style={{
                                    padding: '8px 14px 8px 34px',
                                    borderRadius: '20px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    fontSize: '13px',
                                    width: '200px',
                                    outline: 'none'
                                }}
                            />
                            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '9px' }} />
                        </div>
                    </div>
                </div>

                {/* 본문 그리드 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        찜한 관광지 목록을 불러오는 중입니다...
                    </div>
                ) : wishlist.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <Compass size={48} color="#cbd5e1" style={{ marginBottom: '14px' }} />
                        <h3 style={{ fontSize: '17px', color: '#334155', margin: '0 0 8px 0' }}>
                            아직 찜한 관광지가 없습니다.
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 22px 0' }}>
                            홈페이지 상단의 [관광 지도]에서 가고 싶은 제주 명소를 찾아 하트를 눌러보세요!
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            style={{
                                padding: '11px 24px',
                                backgroundColor: '#123f4d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '24px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            메인으로 돌아가기
                        </button>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '14px'
                    }}>
                        검색 조건에 일치하는 관광지가 없습니다.
                    </div>
                ) : (
                    <div className="stay-grid">
                        {filteredList.map((tour) => {
                            const isRemoving = removingIds.has(tour.contentId);
                            const fullAddr = `${tour.addr1 || ''} ${tour.addr2 || ''}`.trim();
                            const summaryText = cleanHtmlText(tour.overview);

                            return (
                                <article
                                    key={tour.contentId}
                                    className="stay-card"
                                    onClick={() => navigate(`/tours/${tour.contentId}`)}
                                    style={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        opacity: isRemoving ? 0 : 1,
                                        transform: isRemoving ? 'scale(0.92)' : 'scale(1)',
                                        pointerEvents: isRemoving ? 'none' : 'auto',
                                        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                >
                                    <div>
                                        {/* 상단 썸네일 이미지 및 찜 해제 하트 버튼 */}
                                        <div
                                            className="stay-photo"
                                            style={{
                                                backgroundImage: `url(${tour.firstImage || '/jeju-stays.png'})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                position: 'relative',
                                            }}
                                        >
                                            <span className="photo-tag">제주 관광명소</span>

                                            <div
                                                onClick={(e) => handleRemoveLike(e, tour.contentId)}
                                                role="button"
                                                aria-label="관광지 위시리스트 해제"
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(4px)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                    zIndex: 2,
                                                    transition: 'transform 0.15s ease',
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                                            >
                                                <Heart
                                                    size={19}
                                                    fill="#ef4444"
                                                    color="#ef4444"
                                                    strokeWidth={2}
                                                />
                                            </div>
                                        </div>

                                        {/* 하단 관광지 정보 영역 */}
                                        <div className="stay-info">
                                            <div className="stay-location" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={14} />
                                                    {fullAddr.includes('서귀포') ? '서귀포시' : '제주시'}
                                                </span>
                                            </div>

                                            <h3>{tour.title}</h3>

                                            <p style={{ marginBottom: '10px' }}>
                                                {summaryText
                                                    ? `${summaryText.slice(0, 75)}${summaryText.length > 75 ? '...' : ''}`
                                                    : fullAddr || '제주의 아름다운 대표 관광명소입니다.'}
                                            </p>

                                            {/* 이용시간 / 연락처 요약 */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                                                {tour.useTime && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        <Clock size={13} color="#0f766e" style={{ flexShrink: 0 }} />
                                                        {cleanHtmlText(tour.useTime)}
                                                    </span>
                                                )}
                                                {tour.tel && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Phone size={13} color="#0f766e" style={{ flexShrink: 0 }} />
                                                        {cleanHtmlText(tour.tel)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="stay-bottom">
                                                <div>
                                                    <strong style={{ fontSize: '14px', color: '#0f766e' }}>
                                                        {tour.useFee ? cleanHtmlText(tour.useFee).slice(0, 18) : '상세 안내 확인'}
                                                    </strong>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/tours/${tour.contentId}`);
                                                    }}
                                                    aria-label={`${tour.title} 상세보기`}
                                                >
                                                    <ArrowRight size={19} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />

            {/* 내가 찜한 관광지만 지도에 모아서 보여주는 모달 */}
            <TourMapModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                tours={filteredList}
            />
        </div>
    );
}