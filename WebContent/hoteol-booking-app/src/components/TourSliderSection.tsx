import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Navigation,
    MapPin
} from 'lucide-react';
import { fetchMyTourWishlist, toggleTourLike } from '../api/tours';

export interface TourSliderItem {
    contentId: string;
    title: string;
    firstImage?: string;
    addr1?: string;
    distanceKm?: number; // 💡 숙소 상세페이지에서는 전달되고, 홈페이지에서는 생략됨
}

interface TourSliderSectionProps {
    tours: TourSliderItem[];
    headerRender?: React.ReactNode; // 상단 좌측 제목 영역 커스텀
    footerRender?: React.ReactNode; // 하단 '더 많은 관광지를 둘러보세요' 버튼 등 커스텀
    containerStyle?: React.CSSProperties;
}

export function TourSliderSection({
                                      tours,
                                      headerRender,
                                      footerRender,
                                      containerStyle
                                  }: TourSliderSectionProps) {
    const navigate = useNavigate();
    const [slideIndex, setSlideIndex] = useState(0);
    const [likedTourIds, setLikedTourIds] = useState<Set<string>>(new Set());

    const VISIBLE_CARDS = 3;
    const CARD_GAP = 16;
    const displayTours = tours.slice(0, 9); // 최대 9개 노출
    const maxSlideIndex = Math.max(0, displayTours.length - VISIBLE_CARDS);

    const currentPage = Math.floor(slideIndex / VISIBLE_CARDS) + 1;
    const totalPages = Math.max(1, Math.ceil(displayTours.length / VISIBLE_CARDS));

    // 💡 전달받은 관광지 목록(tours)이 바뀌면 슬라이더를 첫 페이지(0)로 리셋
    useEffect(() => {
        setSlideIndex(0);
    }, [tours]);

    // 로그인한 유저의 관광지 찜 목록 동기화
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLikedTourIds(new Set());
            return;
        }
        fetchMyTourWishlist()
            .then((list) => {
                setLikedTourIds(new Set(list.map((t) => t.contentId)));
            })
            .catch(() => setLikedTourIds(new Set()));
    }, []);

    // 찜(하트) 토글 핸들러
    const handleToggleLike = async (e: React.MouseEvent, contentId: string) => {
        e.stopPropagation();

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 기능입니다.');
            navigate('/login');
            return;
        }

        try {
            const res = await toggleTourLike(contentId);
            setLikedTourIds((prev) => {
                const next = new Set(prev);
                if (res.liked) {
                    next.add(contentId);
                } else {
                    next.delete(contentId);
                }
                return next;
            });
        } catch {
            alert('관광지 위시리스트 처리 중 오류가 발생했습니다.');
        }
    };

    if (displayTours.length === 0) return null;

    return (
        <div style={containerStyle}>
            {/* 상단 헤더 + 우측 3개 단위 페이지 화살표 컨트롤 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '22px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div>{headerRender}</div>

                {displayTours.length > VISIBLE_CARDS && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginRight: '4px' }}>
                            {currentPage} / {totalPages} 페이지
                        </span>
                        <button
                            type="button"
                            disabled={slideIndex === 0}
                            onClick={() => setSlideIndex((prev) => Math.max(0, prev - VISIBLE_CARDS))}
                            aria-label="이전 3개 관광지 보기"
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                border: '1px solid #cbd5e1',
                                backgroundColor: slideIndex === 0 ? '#f8fafc' : '#ffffff',
                                color: slideIndex === 0 ? '#cbd5e1' : '#123f4d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: slideIndex === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: slideIndex === 0 ? 'none' : '0 2px 6px rgba(0,0,0,0.06)'
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            disabled={slideIndex >= maxSlideIndex}
                            onClick={() => setSlideIndex((prev) => Math.min(maxSlideIndex, prev + VISIBLE_CARDS))}
                            aria-label="다음 3개 관광지 보기"
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                border: '1px solid #cbd5e1',
                                backgroundColor: slideIndex >= maxSlideIndex ? '#f8fafc' : '#ffffff',
                                color: slideIndex >= maxSlideIndex ? '#cbd5e1' : '#123f4d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: slideIndex >= maxSlideIndex ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: slideIndex >= maxSlideIndex ? 'none' : '0 2px 6px rgba(0,0,0,0.06)'
                            }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* 3개 노출 슬라이더 뷰포트 */}
            <div style={{ overflow: 'hidden', width: '100%', padding: '4px 0' }}>
                <div
                    style={{
                        display: 'flex',
                        gap: `${CARD_GAP}px`,
                        transform: `translateX(calc(-${slideIndex} * ((100% + ${CARD_GAP}px) / ${VISIBLE_CARDS})))`,
                        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    }}
                >
                    {displayTours.map((tour) => {
                        const isLiked = likedTourIds.has(tour.contentId);
                        const hasDistance = tour.distanceKm !== undefined && tour.distanceKm !== null;
                        const regionLabel = tour.addr1?.includes('서귀포') ? '서귀포시' : '제주시';

                        return (
                            <article
                                key={tour.contentId}
                                onClick={() => navigate(`/tours/${tour.contentId}`)}
                                style={{
                                    flex: `0 0 calc((100% - ${(VISIBLE_CARDS - 1) * CARD_GAP}px) / ${VISIBLE_CARDS})`,
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                    backgroundColor: '#ffffff',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.09)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
                                }}
                            >
                                {/* 상단 썸네일 이미지 + 좌측 상단(거리 또는 지역) 뱃지 + 우측 상단 찜 하트 */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: '185px',
                                        backgroundImage: `url(${tour.firstImage || '/jeju-stays.png'})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        position: 'relative',
                                        backgroundColor: '#f1f5f9'
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px',
                                            backgroundColor: 'rgba(18, 63, 77, 0.88)',
                                            backdropFilter: 'blur(4px)',
                                            color: '#ffffff',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                        }}
                                    >
                                        {hasDistance ? (
                                            <>
                                                <Navigation size={11} color="#5eead4" />
                                                숙소에서 {tour.distanceKm}km
                                            </>
                                        ) : (
                                            <>
                                                <MapPin size={11} color="#5eead4" />
                                                {regionLabel}
                                            </>
                                        )}
                                    </span>

                                    {/* 우측 상단 관광지 찜(하트) 버튼 */}
                                    <div
                                        onClick={(e) => handleToggleLike(e, tour.contentId)}
                                        role="button"
                                        aria-label="관광지 위시리스트 토글"
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            width: '34px',
                                            height: '34px',
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
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                                    >
                                        <Heart
                                            size={18}
                                            fill={isLiked ? '#ef4444' : 'none'}
                                            color={isLiked ? '#ef4444' : '#64748b'}
                                            strokeWidth={isLiked ? 2 : 1.8}
                                        />
                                    </div>
                                </div>

                                {/* 하단 텍스트 영역 */}
                                <div style={{ padding: '16px' }}>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#0f766e',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        제주 추천 명소
                                    </span>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        margin: '0 0 10px 0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {tour.title}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '10px',
                                        borderTop: '1px solid #f1f5f9',
                                        fontSize: '12px',
                                        color: '#64748b',
                                        fontWeight: 600
                                    }}>
                                        <span>관광지 상세정보 보기</span>
                                        <ChevronRight size={15} color="#0f766e" />
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            {/* 하단 추가 버튼 영역 (홈페이지의 '더 많은 관광지를 둘러보세요' 버튼 등) */}
            {footerRender && (
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    {footerRender}
                </div>
            )}
        </div>
    );
}