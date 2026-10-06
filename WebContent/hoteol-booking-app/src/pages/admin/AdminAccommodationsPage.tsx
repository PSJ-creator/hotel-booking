import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileCheck, Search } from 'lucide-react';
import { Footer } from '../../components/common/Footer.tsx';
import { PageHeader} from "../../components/common/PageHeader.tsx";
import { PendingAccommodationCard} from "../../components/admim/PendingAccommodationCard.tsx";
import { AdminRejectModal} from "../../components/admim/AdminRejectModal.tsx";

export interface PendingAccommodationItem {
    contentId: string;
    title: string;
    lodgingType: string;
    tel: string;
    zipcode: string;
    addr: string;
    checkinTime: string;
    checkoutTime: string;
    roomCount: string;
    roomType: string;
    parking: string;
    subFacility: string;
    overview: string;
    firstImage: string;
    firstImage2: string;
    mapX: string;
    mapY: string;
    approvalStatus: string;
    hostName?: string;
    hostEmail?: string;
    businessNo?: string;
    createdAt?: string;
}

export function AdminAccommodationsPage() {
    const navigate = useNavigate();

    const [pendingList, setPendingList] = useState<PendingAccommodationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<PendingAccommodationItem | null>(null);

    const loadPendingAccommodations = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        axios.get<PendingAccommodationItem[]>('/api/v1/admin/accommodations/pending', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => setPendingList(res.data || []))
            .catch((err) => {
                console.error('대기 숙소 목록 조회 실패:', err);
                alert('관리자 권한이 없거나 목록을 불러오지 못했습니다.');
                navigate('/');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        loadPendingAccommodations();
    }, []);

    const filteredList = useMemo(() => {
        if (!searchKeyword.trim()) return pendingList;
        const kw = searchKeyword.trim().toLowerCase();
        return pendingList.filter(
            (item) =>
                item.title?.toLowerCase().includes(kw) ||
                item.addr?.toLowerCase().includes(kw) ||
                item.hostName?.toLowerCase().includes(kw) ||
                item.businessNo?.toLowerCase().includes(kw)
        );
    }, [pendingList, searchKeyword]);

    const handleApprove = async (item: PendingAccommodationItem) => {
        const ok = window.confirm(
            `[${item.title}]\n이 숙소의 등록을 승인하시겠습니까?\n승인 즉시 홈페이지 숙소 목록에 정식 노출됩니다.`
        );
        if (!ok) return;

        const token = localStorage.getItem('accessToken');
        setProcessingId(item.contentId);

        try {
            await axios.patch(
                `/api/v1/admin/accommodations/${item.contentId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`[${item.title}] 숙소 승인이 완료되었습니다.`);
            setPendingList((prev) => prev.filter((p) => p.contentId !== item.contentId));
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || '승인 처리 중 오류가 발생했습니다.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleConfirmReject = async (contentId: string, rejectReason: string) => {
        const token = localStorage.getItem('accessToken');
        setProcessingId(contentId);

        try {
            await axios.patch(
                `/api/v1/admin/accommodations/${contentId}/reject`,
                { rejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`[${rejectTarget?.title}] 숙소가 반려 처리되었습니다.\n입력하신 반려 사유가 호스트에게 알림으로 전달됩니다.`);
            setPendingList((prev) => prev.filter((p) => p.contentId !== contentId));
            setRejectTarget(null);
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || '반려 처리 중 오류가 발생했습니다.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 1. 공통 상단 헤더 */}
            <PageHeader
                title="신규 숙소 등록 심사"
                onBack={() => navigate('/')}
                rightElement={
                    <span style={{
                        fontSize: '12px',
                        backgroundColor: '#fce8e6',
                        color: '#c5221f',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 700
                    }}>
                        ADMIN 총괄 관리 센터
                    </span>
                }
            />

            <main className="container" style={{ maxWidth: '980px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 2. 상단 타이틀 및 검색 바 */}
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
                            ACCOMMODATION APPROVAL REVIEW
                        </span>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                            승인 대기 중인 숙소 <span style={{ color: '#0f766e' }}>{pendingList.length}건</span>
                        </h1>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            파트너(호스트)가 신청한 신규 숙소 정보를 검토하고 승인 또는 반려 처리할 수 있습니다.
                        </p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="숙소명, 주소, 호스트, 사업자번호 검색"
                            style={{
                                padding: '9px 14px 9px 36px',
                                borderRadius: '20px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                fontSize: '13px',
                                width: '250px',
                                outline: 'none'
                            }}
                        />
                        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '11px' }} />
                    </div>
                </div>

                {/* 3. 심사 대기 숙소 카드 목록 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        심사 대기 중인 숙소 목록을 불러오는 중입니다...
                    </div>
                ) : filteredList.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <FileCheck size={46} color="#cbd5e1" style={{ marginBottom: '14px' }} />
                        <h3 style={{ fontSize: '17px', color: '#334155', margin: '0 0 8px 0' }}>
                            현재 심사 대기 중인 신규 숙소가 없습니다.
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                            모든 숙소 등록 요청이 처리되었습니다.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {filteredList.map((item) => (
                            <PendingAccommodationCard
                                key={item.contentId}
                                item={item}
                                isProcessing={processingId === item.contentId}
                                onApprove={handleApprove}
                                onOpenReject={(target) => setRejectTarget(target)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {/* 4. 분리된 반려 사유 입력 모달 */}
            <AdminRejectModal
                target={rejectTarget}
                isProcessing={Boolean(rejectTarget && processingId === rejectTarget.contentId)}
                onClose={() => setRejectTarget(null)}
                onConfirmReject={handleConfirmReject}
            />
        </div>
    );
}