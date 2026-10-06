import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createStayReview } from '../../api/reviews.ts'
import type { MyReservationItem} from "../../pages/reservation/MyReservationsPage.tsx";

interface ReviewWriteModalProps {
    target: MyReservationItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReviewWriteModal({ target, onClose, onSuccess }: ReviewWriteModalProps) {
    const [rating, setRating] = useState<number>(5);
    const [reviewContent, setReviewContent] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (target) {
            setRating(5);
            setReviewContent('');
        }
    }, [target]);

    if (!target) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewContent.trim()) {
            alert('리뷰 내용을 입력해 주세요.');
            return;
        }

        setSubmitting(true);
        try {
            await createStayReview({
                reservationId: target.reservationId,
                rating,
                content: reviewContent.trim(),
            });
            alert('소중한 리뷰가 등록되었습니다!');
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.message || '리뷰 등록 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(3px)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    width: '100%',
                    maxWidth: '460px',
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    padding: '28px',
                    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.25)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b'
                    }}
                >
                    <X size={20} />
                </button>

                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e', display: 'block', marginBottom: '4px' }}>
                    WRITE A REVIEW
                </span>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                    {target.stayTitle}
                </h3>
                <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#64748b' }}>
                    이용 객실: {target.roomTitle} ({target.checkInDate} ~ {target.checkOutDate})
                </p>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        숙소 만족도 (별점)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setRating(num)}
                                style={{
                                    fontSize: '28px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    color: num <= rating ? '#f59e0b' : '#cbd5e1',
                                    transition: 'transform 0.1s ease'
                                }}
                            >
                                ★
                            </button>
                        ))}
                        <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 700, color: '#0f766e' }}>
                            {rating}.0점
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        상세 리뷰 내용
                    </label>
                    <textarea
                        rows={4}
                        required
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="숙소의 청결도, 위치, 친절도 등 솔직한 숙박 후기를 남겨주세요."
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            resize: 'vertical',
                            lineHeight: 1.5
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '10px 22px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#123f4d',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? '등록 중...' : '리뷰 등록 완료'}
                    </button>
                </div>
            </form>
        </div>
    );
}