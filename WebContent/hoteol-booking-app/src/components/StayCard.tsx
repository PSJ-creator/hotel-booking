import React from 'react';
import { Heart, MapPin, ArrowRight, BedDouble } from 'lucide-react';
import { getLodgingTypeName, money } from '../data/stays';
import type { Stay } from '../types/stay';

interface StayCardProps {
    stay: Stay;
    isLiked: boolean;
    isRemoving?: boolean;
    showOverview?: boolean;
    onCardClick: (stay: Stay) => void;
    onToggleLike: (e: React.MouseEvent, contentId: string) => void;
}

export function StayCard({
                             stay,
                             isLiked,
                             isRemoving = false,
                             showOverview = true,
                             onCardClick,
                             onToggleLike,
                         }: StayCardProps) {
    const remaining = stay.remainingRooms ?? 0;
    const isUrgent = remaining > 0 && remaining <= 5;

    return (
        <article
            className="stay-card"
            onClick={() => onCardClick(stay)}
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
                {/* 상단 숙소 이미지 및 태그/하트 버튼 */}
                <div
                    className="stay-photo"
                    style={{
                        backgroundImage: `url(${stay.firstImage || stay.firstImage2 || '/jeju-stays.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        position: 'relative',
                    }}
                >
                    <span className="photo-tag">
                        {getLodgingTypeName(stay.lodgingType)}
                    </span>

                    <div
                        onClick={(e) => onToggleLike(e, stay.contentId)}
                        role="button"
                        aria-label="위시리스트 토글"
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.88)',
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
                            fill={isLiked ? '#ef4444' : 'none'}
                            color={isLiked ? '#ef4444' : '#64748b'}
                            strokeWidth={isLiked ? 2 : 1.8}
                        />
                    </div>
                </div>

                {/* 하단 숙소 정보 영역 */}
                <div className="stay-info">
                    {/* 지역명(좌측) + 잔여 객실 뱃지(우측) */}
                    <div
                        className="stay-location"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={15} />
                            {stay.addr?.includes('서귀포') ? '서귀포시' : '제주시'}
                        </span>

                        {/* 💡 잔여 객실 수 뱃지 */}
                        {stay.remainingRooms !== undefined && (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    backgroundColor:
                                        remaining === 0
                                            ? '#f1f5f9'
                                            : isUrgent
                                                ? '#fef2f2'
                                                : '#f0fdfa',
                                    color:
                                        remaining === 0
                                            ? '#94a3b8'
                                            : isUrgent
                                                ? '#dc2626'
                                                : '#0f766e',
                                    border: `1px solid ${
                                        remaining === 0
                                            ? '#e2e8f0'
                                            : isUrgent
                                                ? '#fecaca'
                                                : '#ccfbf1'
                                    }`,
                                }}
                            >
                                <BedDouble size={12} />
                                {remaining === 0
                                    ? '예약 마감'
                                    : isUrgent
                                        ? `마감임박 · 잔여 ${remaining}실`
                                        : `잔여 ${remaining}실`}
                            </span>
                        )}
                    </div>

                    <h3>{stay.title}</h3>
                    {showOverview && (
                        <p>
                            {stay.overview
                                ? `${stay.overview.slice(0, 80)}...`
                                : '편안한 휴식을 제공하는 제주 숙소입니다.'}
                        </p>
                    )}

                    <div className="stay-bottom">
                        <div>
                            <strong>{money(stay.basePrice)}</strong>
                            <small> / 1박 기준가</small>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCardClick(stay);
                            }}
                            aria-label={`${stay.title} 예약 정보 보기`}
                        >
                            <ArrowRight size={19} />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}