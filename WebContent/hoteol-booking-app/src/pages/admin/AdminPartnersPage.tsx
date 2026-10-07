import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users,
    Building2,
    BedDouble,
    TrendingUp,
    Search,
    Mail,
    Briefcase
} from 'lucide-react';
import { money } from '../../data/stays.ts';
import { Footer } from '../../components/common/Footer.tsx';
import { PageHeader } from '../../components/common/PageHeader.tsx';

export interface PartnerStatItem {
    memberId: number;
    hostName: string;
    email: string;
    businessNo: string;
    accomCount: number;
    roomCount: number;
    totalRevenue: number;
}

export function AdminPartnersPage() {
    const navigate = useNavigate();
    const [partners, setPartners] = useState<PartnerStatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        axios.get<PartnerStatItem[]>('/api/v1/admin/partners/stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => setPartners(res.data || []))
            .catch((err) => {
                console.error('파트너 통계 조회 실패:', err);
                alert('목록을 불러오지 못했습니다. 관리자 권한을 확인하세요.');
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    // 대시보드 전체 통계 계산 (한 번의 순회로 전체 요약본 도출)
    const overallStats = useMemo(() => {
        let totalAccom = 0;
        let totalRoom = 0;
        let totalRev = 0;

        partners.forEach(p => {
            totalAccom += p.accomCount;
            totalRoom += p.roomCount;
            totalRev += p.totalRevenue;
        });

        return {
            partnerCount: partners.length,
            totalAccom,
            totalRoom,
            totalRev
        };
    }, [partners]);

    // 검색어 필터링
    const filteredPartners = useMemo(() => {
        if (!searchKeyword.trim()) return partners;
        const kw = searchKeyword.trim().toLowerCase();
        return partners.filter((p) =>
            p.hostName?.toLowerCase().includes(kw) ||
            p.email?.toLowerCase().includes(kw) ||
            p.businessNo?.toLowerCase().includes(kw)
        );
    }, [partners, searchKeyword]);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PageHeader
                title="파트너 및 매출 관리"
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

                {/* 1. 최상단 사이트 전체 요약 대시보드 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '28px'
                }}>
                    <div style={statCardStyle}>
                        <div style={statHeaderStyle}>
                            <span style={statTitleStyle}>전체 파트너 수</span>
                            <Users size={18} color="#123f4d" />
                        </div>
                        <strong style={statValueStyle}>{overallStats.partnerCount}명</strong>
                    </div>

                    <div style={statCardStyle}>
                        <div style={statHeaderStyle}>
                            <span style={statTitleStyle}>등록된 숙소 수</span>
                            <Building2 size={18} color="#0f766e" />
                        </div>
                        <strong style={statValueStyle}>{overallStats.totalAccom}곳</strong>
                    </div>

                    <div style={statCardStyle}>
                        <div style={statHeaderStyle}>
                            <span style={statTitleStyle}>운영 중인 객실 수</span>
                            <BedDouble size={18} color="#0f766e" />
                        </div>
                        <strong style={statValueStyle}>{overallStats.totalRoom}개</strong>
                    </div>

                    <div style={{ ...statCardStyle, backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }}>
                        <div style={statHeaderStyle}>
                            <span style={{ ...statTitleStyle, color: '#0f766e' }}>사이트 총 누적 매출</span>
                            <TrendingUp size={18} color="#0f766e" />
                        </div>
                        <strong style={{ ...statValueStyle, color: '#0f766e' }}>{money(overallStats.totalRev)}</strong>
                    </div>
                </div>

                {/* 2. 타이틀 및 검색바 */}
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
                        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                            파트너별 운영 현황
                        </h1>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            숙소 관리자들의 숙소 등록 개수 및 누적 매출을 확인합니다.
                        </p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="이름, 이메일, 사업자번호 검색"
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

                {/* 3. 파트너 목록 리스트 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        파트너 목록을 불러오는 중입니다...
                    </div>
                ) : filteredPartners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <Users size={46} color="#cbd5e1" style={{ marginBottom: '14px' }} />
                        <h3 style={{ fontSize: '16px', color: '#475569', margin: '0 0 8px 0' }}>
                            등록된 파트너 정보가 없습니다.
                        </h3>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredPartners.map((partner) => (
                            <article
                                key={partner.memberId}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '20px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                                }}
                            >
                                {/* 파트너 프로필 정보 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                            {partner.hostName}
                                        </h3>
                                        <span style={{ fontSize: '11px', color: '#137333', backgroundColor: '#e6f4ea', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                            HOST ID: #{partner.memberId}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#475569' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Mail size={14} color="#94a3b8" /> {partner.email}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Briefcase size={14} color="#94a3b8" /> {partner.businessNo || '미등록'}
                                        </span>
                                    </div>
                                </div>

                                {/* 파트너 실적 통계 박스 */}
                                <div style={{
                                    display: 'flex',
                                    gap: '24px',
                                    backgroundColor: '#f8fafc',
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>운영 숙소</span>
                                        <strong style={{ fontSize: '16px', color: '#123f4d' }}>{partner.accomCount}곳</strong>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>보유 객실</span>
                                        <strong style={{ fontSize: '16px', color: '#123f4d' }}>{partner.roomCount}개</strong>
                                    </div>
                                    <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '24px' }}>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>총 누적 매출</span>
                                        <strong style={{ fontSize: '16px', color: '#0f766e' }}>{money(partner.totalRevenue)}</strong>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

const statCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
};

const statHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
};

const statTitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 600
};

const statValueStyle: React.CSSProperties = {
    fontSize: '26px',
    color: '#0f172a',
    fontWeight: 800
};