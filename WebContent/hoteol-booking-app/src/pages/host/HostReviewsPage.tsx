import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search } from 'lucide-react';
import { fetchHostReviews, type ReviewItem } from '../../api/reviews.ts';
import { Footer } from '../../components/common/Footer.tsx';
import { PageHeader} from "../../components/common/PageHeader.tsx";
import { HostReviewCard} from "../../components/host/HostReviewCard.tsx";

export function HostReviewsPage() {
    const navigate = useNavigate();

    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREPLIED' | 'REPLIED'>('ALL');
    const [selectedStay, setSelectedStay] = useState<string>('ALL');
    const [searchKeyword, setSearchKeyword] = useState('');

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

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 1. 공통 상단 헤더 */}
            <PageHeader
                title="숙소 리뷰 및 답글 관리"
                rightElement={
                    <span style={{
                        fontSize: '12px',
                        backgroundColor: '#e6f4ea',
                        color: '#137333',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 600
                    }}>
                        HOST 파트너 센터
                    </span>
                }
            />

            <main className="container" style={{ maxWidth: '940px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 2. 상단 필터 및 검색 바 */}
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
                                    onClick={() => setFilterStatus(tab.key as 'ALL' | 'UNREPLIED' | 'REPLIED')}
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

                {/* 3. 리뷰 목록 */}
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
                            <HostReviewCard
                                key={rev.reviewId}
                                review={rev}
                                onRefresh={loadReviews}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}