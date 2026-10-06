import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Clock, Phone, ArrowRight } from 'lucide-react';
import type { TourSummary } from '../../api/tours.ts'

function cleanHtmlText(text?: string): string {
    if (!text) return '';
    return text
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<[^>]*>?/gm, '')
        .trim();
}

interface TourWishlistCardProps {
    tour: TourSummary;
    isRemoving: boolean;
    onRemoveLike: (e: React.MouseEvent, contentId: string) => void;
}

export function TourWishlistCard({
                                     tour,
                                     isRemoving,
                                     onRemoveLike
                                 }: TourWishlistCardProps) {
    const navigate = useNavigate();
    const fullAddr = `${tour.addr1 || ''} ${tour.addr2 || ''}`.trim();
    const summaryText = cleanHtmlText(tour.overview);

    return (
        <article
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
                        onClick={(e) => onRemoveLike(e, tour.contentId)}
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
}