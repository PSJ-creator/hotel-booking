import { useState, useMemo, useEffect } from 'react';
import { Star, X, CornerDownRight } from 'lucide-react';
import type { ReviewItem} from "../../api/reviews.ts";

interface StayReviewSectionProps {
    stayTitle: string;
    reviews: ReviewItem[];
}

export function StayReviewSection({ stayTitle, reviews }: StayReviewSectionProps) {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return '0.0';
        const sum = reviews.reduce((acc, cur) => acc + (cur.rating || 0), 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    useEffect(() => {
        if (isReviewModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isReviewModalOpen]);

    return (
        <>
            {/* 1. 본문 리뷰 3개 미리보기 영역 */}
            <div style={{ marginTop: '22px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={18} fill="#f59e0b" color="#f59e0b" />
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                            이용객 실제 리뷰 ({reviews.length}개)
                        </strong>
                        {reviews.length > 0 && (
                            <span style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#0f766e',
                                backgroundColor: '#f0fdfa',
                                padding: '2px 8px',
                                borderRadius: '8px'
                            }}>
                                평점 ★ {averageRating}
                            </span>
                        )}
                    </div>

                    {reviews.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsReviewModalOpen(true)}
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#123f4d',
                                cursor: 'pointer'
                            }}
                        >
                            전체 리뷰 보기 ({reviews.length})
                        </button>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#94a3b8'
                    }}>
                        아직 작성된 리뷰가 없습니다. 숙소 이용 후기를 남겨 첫 주인공이 되어보세요!
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '12px'
                    }}>
                        {reviews.slice(0, 3).map((rev) => (
                            <div
                                key={rev.reviewId}
                                onClick={() => setIsReviewModalOpen(true)}
                                style={{
                                    padding: '14px 16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '8px'
                                }}
                            >
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '6px'
                                    }}>
                                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{rev.authorName}</strong>
                                        <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>
                                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#334155',
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {rev.content}
                                    </p>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '11px',
                                    color: '#94a3b8'
                                }}>
                                    <span>{rev.roomTitle}</span>
                                    {rev.hostReply && (
                                        <span style={{ color: '#0f766e', fontWeight: 700 }}>사장님 답글 있음</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. 전체 리뷰 보기 팝업 모달 */}
            {isReviewModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 3000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setIsReviewModalOpen(false)}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '720px',
                            maxHeight: '85vh',
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                                    {stayTitle} 전체 리뷰 ({reviews.length})
                                </h3>
                                <span style={{ fontSize: '13px', color: '#0f766e', fontWeight: 700 }}>
                                    평균 별점 ★ {averageRating} / 5.0
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsReviewModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reviews.map((rev) => (
                                <div
                                    key={rev.reviewId}
                                    style={{
                                        padding: '18px',
                                        borderRadius: '14px',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <div>
                                            <strong style={{ fontSize: '14px', color: '#0f172a', marginRight: '8px' }}>{rev.authorName}</strong>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>· {rev.roomTitle}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {rev.createdAt ? rev.createdAt.split('T')[0] : ''}
                                        </span>
                                    </div>

                                    <div style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                    </div>

                                    <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                        {rev.content}
                                    </p>

                                    {rev.hostReply && (
                                        <div style={{
                                            marginTop: '14px',
                                            padding: '14px 16px',
                                            backgroundColor: '#f0fdfa',
                                            borderRadius: '10px',
                                            border: '1px solid #ccfbf1'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#0f766e' }}>
                                                <CornerDownRight size={14} /> {stayTitle}
                                                {rev.repliedAt && (
                                                    <span style={{ fontWeight: 400, color: '#64748b', marginLeft: '4px' }}>
                                                        ({rev.repliedAt.split('T')[0]})
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                                                {rev.hostReply}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}