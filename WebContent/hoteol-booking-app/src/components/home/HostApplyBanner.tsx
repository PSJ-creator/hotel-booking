import React, { useState, useEffect } from 'react';
import { requestApplyHost } from '../../api/auth.ts';
import axios from 'axios';
import { X, Building } from 'lucide-react';

export function HostApplyBanner() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [businessNo, setBusinessNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const base64Payload = token.split('.')[1];
                const decodedPayload = JSON.parse(
                    decodeURIComponent(
                        atob(base64Payload)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    )
                );
                setUserRole(decodedPayload.role || null);
            } catch {
                setUserRole(null);
            }
        } else {
            setUserRole(null);
        }
    }, []);
    if (userRole !== 'ROLE_USER') {
        return null;
    }

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessNo.trim()) {
            setErrorMessage('사업자등록번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const data = await requestApplyHost(businessNo.trim());
            localStorage.setItem('accessToken', data.token);
            alert('숙소 관리자 신청이 완료되었습니다! 파트너 권한으로 전환됩니다.');
            setIsModalOpen(false);
            window.location.reload();
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setErrorMessage(err.response.data?.message || '신청 처리 중 오류가 발생했습니다.');
            } else {
                setErrorMessage('서버와 통신할 수 없습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ backgroundColor: '#0f333f', padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '16px'
            }}>
                {/* 1. 좌측 균형을 맞추기 위한 빈 영역 */}
                <div />

                {/* 2. 중앙으로 배치되는 문구 영역 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(110, 231, 183, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Building size={20} color="#6ee7b7" />
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#ffffff', fontSize: '15px' }}>
                            숙소를 신청하고 싶은가요?
                        </strong>
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                파트너로 등록하고 더 많은 여행객에게 숙소를 소개해 보세요.
            </span>
                    </div>
                </div>

                {/* 3. 우측 끝에 고정되는 버튼 영역 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            padding: '10px 22px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#123f4d',
                            backgroundColor: '#6ee7b7',
                            border: 'none',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(110, 231, 183, 0.2)',
                        }}
                    >
                        숙소관리자 신청
                    </button>
                </div>
            </div>

            {/* 사업자번호 입력 모달창 */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        width: '90%',
                        maxWidth: '400px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '28px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} color="#64748b" />
                        </button>

                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>숙소 관리자(호스트) 신청</h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
                            운영 중이신 사업자등록번호를 입력하시면 즉시 호스트 권한이 부여됩니다.
                        </p>

                        {errorMessage && (
                            <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleApply}>
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    사업자등록번호
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={businessNo}
                                    onChange={(e) => setBusinessNo(e.target.value)}
                                    placeholder="000-00-00000"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        boxSizing: 'border-box',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '11px',
                                    backgroundColor: '#123f4d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? '신청 진행 중...' : '신청 완료'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}