import React, { useState } from 'react';
import { CornerDownRight, Edit3, Trash2, Send } from 'lucide-react';
import { saveReviewReply, deleteReviewReply, type ReviewItem } from '../../api/reviews.ts'

interface HostReviewCardProps {
    review: ReviewItem;
    onRefresh: () => void;
}

export function HostReviewCard({ review, onRefresh }: HostReviewCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [replyText, setReplyText] = useState(review.hostReply || '');
    const [submitting, setSubmitting] = useState(false);

    const handleOpenForm = () => {
        setReplyText(review.hostReply || '');
        setIsEditing(true);
    };

    const handleSaveReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) {
            alert('답글 내용을 입력해 주세요.');
            return;
        }
        setSubmitting(true);
        try {
            await saveReviewReply(review.reviewId, replyText.trim());
            alert('답글이 등록되었습니다.');
            setIsEditing(false);
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || '답글 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async () => {
        if (!window.confirm('작성한 답글을 삭제하시겠습니까?')) return;
        try {
            await deleteReviewReply(review.reviewId);
            alert('답글이 삭제되었습니다.');
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || '답글 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <article
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
        >
            {/* 1. 상단 메타 정보 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e', backgroundColor: '#f0fdfa', padding: '3px 9px', borderRadius: '6px' }}>
                        {review.stayTitle}
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>· {review.roomTitle}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {review.createdAt ? review.createdAt.split('T')[0] : ''} 작성
                </span>
            </div>

            {/* 2. 작성자 & 별점 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{review.authorName} 님</strong>
                <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700 }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} ({review.rating}점)
                </span>
            </div>

            {/* 3. 리뷰 본문 */}
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {review.content}
            </p>

            {/* 4. 등록된 답글 표시 또는 답글 작성 폼 */}
            {review.hostReply && !isEditing ? (
                <div style={{
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    borderRadius: '12px',
                    padding: '16px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0f766e' }}>
                            <CornerDownRight size={15} /> 내 답글
                            {review.repliedAt && (
                                <small style={{ fontWeight: 400, color: '#64748b' }}>
                                    ({review.repliedAt.split('T')[0]})
                                </small>
                            )}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                type="button"
                                onClick={handleOpenForm}
                                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Edit3 size={12} /> 답글 수정
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteReply}
                                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fff1f2', color: '#e11d48', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Trash2 size={12} /> 답글 삭제
                            </button>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {review.hostReply}
                    </p>
                </div>
            ) : isEditing ? (
                <form onSubmit={handleSaveReply} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <textarea
                        rows={3}
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="고객님의 소중한 리뷰에 감사 답글을 남겨보세요."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <Send size={13} /> {submitting ? '저장 중...' : '답글 저장'}
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{ textAlign: 'right' }}>
                    <button
                        type="button"
                        onClick={handleOpenForm}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: '#f0fdfa', color: '#0f766e', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <CornerDownRight size={14} /> 사장님 답글 달기
                    </button>
                </div>
            )}
        </article>
    );
}