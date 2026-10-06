import {
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
    Sparkles
} from 'lucide-react';
import { getLodgingTypeName } from '../../data/stays.ts'
import type { PendingAccommodationItem} from "../../pages/admin/AdminAccommodationsPage.tsx";

interface PendingAccommodationCardProps {
    item: PendingAccommodationItem;
    isProcessing: boolean;
    onApprove: (item: PendingAccommodationItem) => void;
    onOpenReject: (item: PendingAccommodationItem) => void;
}

export function PendingAccommodationCard({
                                             item,
                                             isProcessing,
                                             onApprove,
                                             onOpenReject
                                         }: PendingAccommodationCardProps) {
    const createdDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '.') : '최근 신청';

    return (
        <article
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
                    onClick={() => onOpenReject(item)}
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
                    onClick={() => onApprove(item)}
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
}