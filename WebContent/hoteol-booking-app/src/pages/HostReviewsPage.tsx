import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    MessageSquare,
    CornerDownRight,
    Trash2,
    Edit3,
    Send,
    Search
} from 'lucide-react';
import {
    fetchHostReviews,
    saveReviewReply,
    deleteReviewReply,
    type ReviewItem
} from '../api/reviews';
import { Footer } from '../components/Footer';

export function HostReviewsPage() {
    const navigate = useNavigate();

    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREPLIED' | 'REPLIED'>('ALL');
    const [selectedStay, setSelectedStay] = useState<string>('ALL');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 현재 답글 입력창이 열려있는 reviewId와 입력 텍스트
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadReviews = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        setLoading(true);
        fetchHostReviews()
            .then((data) => setReviews(data || []))
            .catch(() => alert('리뷰 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        loadReviews();
    }, []);

    const stayOptions = useMemo(() => {
        const map = new Map<string, string>();
        reviews.forEach((r) => map.set(r.contentId, r.stayTitle));
        return Array.from(map.entries());
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter((r) => {
            if (filterStatus === 'UNREPLIED' && r.hostReply) return false;
            if (filterStatus === 'REPLIED' && !r.hostReply) return false;
            if (selectedStay !== 'ALL' && r.contentId !== selectedStay) return false;
            if (searchKeyword.trim()) {
                const kw = searchKeyword.trim().toLowerCase();
                const match =
                    r.content?.toLowerCase().includes(kw) ||
                    r.authorName?.toLowerCase().includes(kw) ||
                    r.stayTitle?.toLowerCase().includes(kw);
                if (!match) return false;
            }
            return true;
        });
    }, [reviews, filterStatus, selectedStay, searchKeyword]);

    const handleOpenReplyForm = (rev: ReviewItem) => {
        setActiveReplyId(rev.reviewId);
        setReplyText(rev.hostReply || '');
    };

    const handleSaveReply = async (e: React.FormEvent, reviewId: number) => {
        e.preventDefault();
        if (!replyText.trim()) {
            alert('답글 내용을 입력해 주세요.');
            return;
        }
        setSubmitting(true);
        try {
            await saveReviewReply(reviewId, replyText.trim());
            alert('답글이 등록되었습니다.');
            setActiveReplyId(null);
            loadReviews();
        } catch (err: any) {
            alert(err.response?.data?.message || '답글 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async (reviewId: number) => {
        if (!window.confirm('작성한 답글을 삭제하시겠습니까?')) return;
        try {
            await deleteReviewReply(reviewId);
            alert('답글이 삭제되었습니다.');
            loadReviews();
        } catch (err: any) {
            alert(err.response?.data?.message || '답글 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ChevronLeft size={24} color="#123f4d" />
                        </button>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>숙소 리뷰 및 답글 관리</span>
                    </div>
                    <span style={{ fontSize: '12px', backgroundColor: '#e6f4ea', color: '#137333', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        HOST 파트너 센터
                    </span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '940px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 상단 필터 및 검색 바 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { key: 'ALL', label: `전체 리뷰 (${reviews.length})` },
                            { key: 'UNREPLIED', label: `미답변 (${reviews.filter((r) => !r.hostReply).length})` },
                            { key: 'REPLIED', label: `답변 완료 (${reviews.filter((r) => r.hostReply).length})` },
                        ].map((tab) => {
                            const active = filterStatus === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setFilterStatus(tab.key as any)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: active ? '1px solid #123f4d' : '1px solid #cbd5e1',
                                        backgroundColor: active ? '#123f4d' : '#ffffff',
                                        color: active ? '#ffffff' : '#475569',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {stayOptions.length > 1 && (
                            <select
                                value={selectedStay}
                                onChange={(e) => setSelectedStay(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                            >
                                <option value="ALL">모든 내 숙소</option>
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
                                placeholder="작성자, 리뷰 내용 검색"
                                style={{ padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', width: '200px' }}
                            />
                            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '10px' }} />
                        </div>
                    </div>
                </div>

                {/* 리뷰 목록 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>리뷰 내역을 불러오는 중입니다...</div>
                ) : filteredReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <MessageSquare size={44} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '16px', color: '#475569', margin: '0 0 6px 0' }}>등록된 리뷰가 없습니다.</h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>투숙객이 리뷰를 남기면 이곳에서 확인하고 답글을 달 수 있습니다.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredReviews.map((rev) => (
                            <article
                                key={rev.reviewId}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '22px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                                }}
                            >
                                {/* 상단 메타 정보 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e', backgroundColor: '#f0fdfa', padding: '3px 9px', borderRadius: '6px' }}>
                                            {rev.stayTitle}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>· {rev.roomTitle}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {rev.createdAt ? rev.createdAt.split('T')[0] : ''} 작성
                                    </span>
                                </div>

                                {/* 작성자 & 별점 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{rev.authorName} 님</strong>
                                    <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700 }}>
                                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)} ({rev.rating}점)
                                    </span>
                                </div>

                                {/* 리뷰 본문 */}
                                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                    {rev.content}
                                </p>

                                {/* 등록된 답글 표시 또는 답글 작성 버튼 */}
                                {rev.hostReply && activeReplyId !== rev.reviewId ? (
                                    <div style={{
                                        backgroundColor: '#f0fdfa',
                                        border: '1px solid #ccfbf1',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0f766e' }}>
                                                <CornerDownRight size={15} /> 내 답글
                                                {rev.repliedAt && (
                                                    <small style={{ fontWeight: 400, color: '#64748b' }}>
                                                        ({rev.repliedAt.split('T')[0]})
                                                    </small>
                                                )}
                                            </span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenReplyForm(rev)}
                                                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Edit3 size={12} /> 답글 수정
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteReply(rev.reviewId)}
                                                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fff1f2', color: '#e11d48', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Trash2 size={12} /> 답글 삭제
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                            {rev.hostReply}
                                        </p>
                                    </div>
                                ) : activeReplyId === rev.reviewId ? (
                                    <form onSubmit={(e) => handleSaveReply(e, rev.reviewId)} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
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
                                                onClick={() => setActiveReplyId(null)}
                                                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                취소
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Send size={13} /> 답글 저장
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenReplyForm(rev)}
                                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: '#f0fdfa', color: '#0f766e', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <CornerDownRight size={14} /> 사장님 답글 달기
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}