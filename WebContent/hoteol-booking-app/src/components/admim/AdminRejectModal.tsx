import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { PendingAccommodationItem} from "../../pages/admin/AdminAccommodationsPage.tsx";

interface AdminRejectModalProps {
    target: PendingAccommodationItem | null;
    isProcessing: boolean;
    onClose: () => void;
    onConfirmReject: (contentId: string, rejectReason: string) => void;
}

export function AdminRejectModal({
                                     target,
                                     isProcessing,
                                     onClose,
                                     onConfirmReject
                                 }: AdminRejectModalProps) {
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        if (target) setRejectReason('');
    }, [target]);

    if (!target) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            alert('반려 사유를 입력해 주세요.');
            return;
        }
        onConfirmReject(target.contentId, rejectReason.trim());
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#e11d48' }}>
                    <AlertTriangle size={22} />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                        숙소 등록 반려 처리
                    </h3>
                </div>

                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                    <strong>[{target.title}]</strong> 숙소의 반려 사유를 작성해 주세요.<br />
                    입력하신 사유는 호스트의 알림창과 숙소 관리 페이지에 표시됩니다.
                </p>

                <form onSubmit={handleSubmit}>
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
                            disabled={isProcessing}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#e11d48',
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: isProcessing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isProcessing ? '처리 중...' : '반려 확정'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}