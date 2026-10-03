import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft,
    FileCheck,
    CheckCircle2,
    XCircle,
    Building2,
    MapPin,
    Phone,
    Clock,
    Car,
    User,
    Mail,
    Briefcase,
    Search,
    Sparkles,
    X,
    AlertTriangle
} from 'lucide-react';
import { getLodgingTypeName } from '../data/stays';
import { Footer } from '../components/Footer';

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

    // 반려 모달 상태
    const [rejectTarget, setRejectTarget] = useState<PendingAccommodationItem | null>(null);
    const [rejectReason, setRejectReason] = useState('');

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

    // 키워드 검색 필터링
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

    // 1. 숙소 승인 핸들러
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

    // 2. 숙소 반려 모달 오픈
    const openRejectModal = (item: PendingAccommodationItem) => {
        setRejectTarget(item);
        setRejectReason('');
    };

    // 3. 숙소 반려 제출 핸들러
    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectTarget) return;

        if (!rejectReason.trim()) {
            alert('반려 사유를 입력해 주세요.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        setProcessingId(rejectTarget.contentId);

        try {
            await axios.patch(
                `/api/v1/admin/accommodations/${rejectTarget.contentId}/reject`,
                { rejectReason: rejectReason.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`[${rejectTarget.title}] 숙소가 반려 처리되었습니다.\n입력하신 반려 사유가 호스트에게 알림으로 전달됩니다.`);
            setPendingList((prev) => prev.filter((p) => p.contentId !== rejectTarget.contentId));
            setRejectTarget(null);
            setRejectReason('');
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || '반려 처리 중 오류가 발생했습니다.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 상단 네비게이션 헤더 */}
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <ChevronLeft size={24} color="#123f4d" />
                        </button>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>신규 숙소 등록 심사</span>
                    </div>
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
                </div>
            </header>

            <main className="container" style={{ maxWidth: '980px', margin: '28px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {/* 상단 타이틀 및 검색 바 */}
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

                {/* 본문 리스트 */}
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
                        {filteredList.map((item) => {
                            const createdDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '.') : '최근 신청';
                            const isProcessing = processingId === item.contentId;

                            return (
                                <article
                                    key={item.contentId}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '18px',
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
                                    }}
                                >
                                    {/* 1. 상단 바: 콘텐츠 ID + 신청일 + 대기 상태 뱃지 */}
                                    <div style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: '#0f766e',
                                                backgroundColor: '#ccfbf1',
                                                padding: '3px 9px',
                                                borderRadius: '6px'
                                            }}>
                                                {getLodgingTypeName(item.lodgingType)}
                                            </span>
                                            <strong style={{ color: '#0f172a' }}>숙소 ID #{item.contentId}</strong>
                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>· {createdDate} 신청</span>
                                        </div>

                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            backgroundColor: '#fef3c7',
                                            color: '#b45309'
                                        }}>
                                            승인 심사 대기 (PENDING)
                                        </span>
                                    </div>

                                    {/* 2. 중단 본문: 좌측(대표 이미지) + 중앙(숙소 상세 스펙) + 우측(신청 호스트 정보) */}
                                    <div style={{
                                        padding: '24px',
                                        display: 'grid',
                                        gridTemplateColumns: '200px 1.5fr 1fr',
                                        gap: '22px',
                                        alignItems: 'start'
                                    }}>
                                        {/* 대표 이미지 썸네일 */}
                                        <div>
                                            <div
                                                style={{
                                                    width: '200px',
                                                    height: '145px',
                                                    borderRadius: '12px',
                                                    backgroundImage: `url(${item.firstImage || item.firstImage2 || '/jeju-stays.png'})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    border: '1px solid #e2e8f0',
                                                    backgroundColor: '#f1f5f9'
                                                }}
                                            />
                                            {item.firstImage2 && (
                                                <div
                                                    style={{
                                                        marginTop: '8px',
                                                        width: '200px',
                                                        height: '65px',
                                                        borderRadius: '8px',
                                                        backgroundImage: `url(${item.firstImage2})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        border: '1px solid #e2e8f0'
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* 숙소 상세 정보 */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                                {item.title}
                                            </h2>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                                                <MapPin size={15} color="#0f766e" style={{ flexShrink: 0 }} />
                                                <span>{item.addr || '주소 미입력'} {item.zipcode && `(${item.zipcode})`}</span>
                                            </div>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '8px',
                                                backgroundColor: '#f8fafc',
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '12px',
                                                color: '#334155',
                                                marginTop: '4px'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Phone size={13} color="#0f766e" /> 연락처: {item.tel || '-'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Building2 size={13} color="#0f766e" /> 객실수: {item.roomCount || '-'} ({item.roomType || '-'})
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={13} color="#0f766e" /> 입/퇴실: {item.checkinTime || '15:00'} ~ {item.checkoutTime || '11:00'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Car size={13} color="#0f766e" /> 주차: {item.parking || '-'}
                                                </span>
                                            </div>

                                            {item.subFacility && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0f766e', fontWeight: 600 }}>
                                                    <Sparkles size={13} style={{ flexShrink: 0 }} />
                                                    <span>부대시설: {item.subFacility}</span>
                                                </div>
                                            )}

                                            <p style={{
                                                margin: '4px 0 0 0',
                                                fontSize: '13px',
                                                color: '#475569',
                                                lineHeight: 1.6,
                                                backgroundColor: '#fcfdfe',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #f1f5f9',
                                                maxHeight: '95px',
                                                overflowY: 'auto',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {item.overview || '상세 소개글이 작성되지 않았습니다.'}
                                            </p>
                                        </div>

                                        {/* 우측 신청 호스트(파트너) 정보 박스 */}
                                        <div style={{
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
                                                신청 파트너(HOST) 정보
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                                <User size={15} color="#0f766e" />
                                                <span>{item.hostName || '호스트'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                                                <Mail size={14} color="#94a3b8" />
                                                <span>{item.hostEmail || '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                                                <Briefcase size={14} color="#0f766e" />
                                                <span>사업자번호: {item.businessNo || '미등록'}</span>
                                            </div>
                                            <div style={{
                                                marginTop: '6px',
                                                paddingTop: '8px',
                                                borderTop: '1px dashed #cbd5e1',
                                                fontSize: '11px',
                                                color: '#64748b'
                                            }}>
                                                좌표: X({item.mapX || '-'}) / Y({item.mapY || '-'})
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. 하단 바: 반려 / 승인 액션 버튼 */}
                                    <div style={{
                                        padding: '14px 24px',
                                        borderTop: '1px solid #f1f5f9',
                                        backgroundColor: '#fcfdfe',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <button
                                            type="button"
                                            disabled={isProcessing}
                                            onClick={() => openRejectModal(item)}
                                            style={{
                                                padding: '10px 18px',
                                                backgroundColor: '#fff1f2',
                                                color: '#e11d48',
                                                border: '1px solid #fecdd3',
                                                borderRadius: '10px',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <XCircle size={16} /> 반려 처리
                                        </button>

                                        <button
                                            type="button"
                                            disabled={isProcessing}
                                            onClick={() => handleApprove(item)}
                                            style={{
                                                padding: '10px 22px',
                                                backgroundColor: '#0f766e',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                                            }}
                                        >
                                            <CheckCircle2 size={16} />
                                            {isProcessing ? '처리 중...' : '숙소 등록 승인'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />

            {/* 💡 반려 사유 입력 모달창 */}
            {rejectTarget && (
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
                    onClick={() => setRejectTarget(null)}
                >
                    <div
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
                            onClick={() => setRejectTarget(null)}
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#e11d48' }}>
                            <AlertTriangle size={22} />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                                숙소 등록 반려 처리
                            </h3>
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                            <strong>[{rejectTarget.title}]</strong> 숙소의 반려 사유를 작성해 주세요.<br />
                            입력하신 사유는 호스트의 알림창과 숙소 관리 페이지에 표시됩니다.
                        </p>

                        <form onSubmit={handleRejectSubmit}>
                            <textarea
                                rows={4}
                                required
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="예: 대표 이미지 해상도가 낮고 상세 주소가 누락되었습니다. 수정 후 다시 확인 부탁드립니다."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '13px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    resize: 'vertical',
                                    lineHeight: 1.5,
                                    marginBottom: '18px'
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setRejectTarget(null)}
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
                                    disabled={processingId === rejectTarget.contentId}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#e11d48',
                                        color: '#ffffff',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: processingId === rejectTarget.contentId ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {processingId === rejectTarget.contentId ? '처리 중...' : '반려 확정'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}