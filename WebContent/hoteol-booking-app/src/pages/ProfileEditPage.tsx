import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, User, Mail, Lock, Building, AlertTriangle } from 'lucide-react';
import { Footer } from '../components/Footer';

interface UserProfile {
    email: string;
    name: string;
    role: string;
    businessNo?: string;
    isSocial: boolean;
}

export function ProfileEditPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }

        axios.get<UserProfile>('/api/v1/members/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setProfile(res.data);
                setName(res.data.name);
            })
            .catch(() => {
                alert('회원 정보를 불러오지 못했습니다.');
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    // 회원정보 수정 제출
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                setErrorMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                return;
            }
            if (newPassword.length < 4) {
                setErrorMessage('새 비밀번호는 최소 4자 이상이어야 합니다.');
                return;
            }
            if (!currentPassword) {
                setErrorMessage('비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.');
                return;
            }
        }

        setSaving(true);
        const token = localStorage.getItem('accessToken');

        try {
            const res = await axios.put<{ token: string }>('/api/v1/members/me', {
                name,
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 변경된 정보가 담긴 새 토큰 저장
            localStorage.setItem('accessToken', res.data.token);
            alert('회원정보가 성공적으로 수정되었습니다.');
            window.location.reload();
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || '회원정보 수정 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    // 숙소 관리자 탈퇴 (일반 유저 전환)
    const handleDowngradeHost = async () => {
        const confirmAction = window.confirm(
            '정말 숙소 관리자 자격을 해지하시겠습니까?\n해지 시 일반 회원으로 전환되며 등록된 숙소 관리 기능을 이용할 수 없습니다.'
        );
        if (!confirmAction) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await axios.patch<{ token: string }>('/api/v1/members/me/downgrade-host', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.setItem('accessToken', res.data.token);
            alert('숙소 관리자 자격이 해지되어 일반 회원으로 전환되었습니다.');
            window.location.href = '/';
        } catch (err: any) {
            alert(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
        }
    };

    // 💡 회원 탈퇴 버튼 클릭 (WITHDRAWN 상태 변경 및 이메일/이름 Unknown 처리)
    const handleWithdraw = async () => {
        const confirmWithdraw = window.confirm(
            '정말 제주 야호 회원을 탈퇴하시겠습니까?\n\n' +
            '· 이용 예정인 예약이나 보유하신 숙소가 있는 경우 탈퇴할 수 없습니다.\n' +
            '· 탈퇴 시 계정은 즉시 비활성화 처리되며 로그아웃됩니다.'
        );
        if (!confirmWithdraw) return;

        setWithdrawing(true);
        setErrorMessage('');
        const token = localStorage.getItem('accessToken');

        try {
            const res = await axios.delete('/api/v1/members/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.removeItem('accessToken');
            alert(res.data?.message || '회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.');
            window.location.href = '/';
        } catch (err: any) {
            alert(
                err.response?.data?.message ||
                err.response?.data ||
                '회원 탈퇴 처리 중 오류가 발생했습니다.'
            );
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '120px 0', color: '#64748b' }}>회원 정보를 불러오는 중입니다...</div>;
    }

    if (!profile) return null;

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>회원정보 수정</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>내 정보 관리</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>프로필 정보를 수정하거나 비밀번호를 변경할 수 있습니다.</p>

                    {errorMessage && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#fde8e8', color: '#dc2626', borderRadius: '8px', fontSize: '13px', marginBottom: '18px' }}>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleUpdate}>
                        {/* 1. 이메일 (회색 처리 & 수정 불가) */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                이메일 계정
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={profile.email}
                                    disabled
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '11px 12px 11px 40px',
                                        backgroundColor: '#e2e8f0',
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        cursor: 'not-allowed',
                                        userSelect: 'none'
                                    }}
                                />
                                <Mail size={17} color="#64748b" style={{ position: 'absolute', top: '13px', left: '13px' }} />
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                이메일은 변경할 수 없는 고유 계정 ID입니다.
                            </span>
                        </div>

                        {/* 2. 이름 */}
                        <div style={{ marginBottom: '22px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                이름
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름 입력"
                                    style={{ width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                                <User size={17} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '13px' }} />
                            </div>
                        </div>

                        {/* 숙소 관리자 사업자 번호 표시 (있을 경우) */}
                        {profile.role === 'ROLE_HOST' && profile.businessNo && (
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    사업자등록번호
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={profile.businessNo}
                                        disabled
                                        style={{ width: '100%', padding: '11px 12px 11px 40px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                    <Building size={17} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '13px' }} />
                                </div>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />

                        {/* 3. 비밀번호 변경 영역 (소셜 가입자는 숨김) */}
                        {!profile.isSocial ? (
                            <>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                                    비밀번호 변경
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                                    비밀번호를 변경하지 않으려면 입력칸을 비워두세요.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="현재 비밀번호 입력"
                                            style={{ width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                        <Lock size={17} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '13px' }} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="새 비밀번호 (4자 이상)"
                                            style={{ width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                        <Lock size={17} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '13px' }} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="새 비밀번호 확인"
                                            style={{ width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                        <Lock size={17} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '13px' }} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>
                                카카오 소셜 간편 로그인 계정은 비밀번호 변경이 필요하지 않습니다.
                            </div>
                        )}

                        {/* 4. 하단 액션 버튼 배치 영역 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '32px',
                            paddingTop: '20px',
                            borderTop: '1px solid #f1f5f9',
                            gap: '12px'
                        }}>
                            {/* 좌측 끝: 회원탈퇴 버튼 */}
                            <button
                                type="button"
                                disabled={withdrawing || saving}
                                onClick={handleWithdraw}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    fontSize: '13px',
                                    cursor: withdrawing || saving ? 'not-allowed' : 'pointer',
                                    textDecoration: 'underline',
                                    padding: '6px 0',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {withdrawing ? '탈퇴 처리 중...' : '회원탈퇴'}
                            </button>

                            {/* 우측 그룹 (중간: 숙소 관리자 탈퇴 / 우측 끝: 회원정보 수정) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {profile.role === 'ROLE_HOST' && (
                                    <button
                                        type="button"
                                        disabled={saving || withdrawing}
                                        onClick={handleDowngradeHost}
                                        style={{
                                            padding: '11px 16px',
                                            backgroundColor: '#fff1f2',
                                            color: '#e11d48',
                                            border: '1px solid #fecdd3',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: saving || withdrawing ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <AlertTriangle size={15} /> 숙소 관리자 해지
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={saving || withdrawing}
                                    style={{
                                        padding: '11px 22px',
                                        backgroundColor: '#123f4d',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: saving || withdrawing ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {saving ? '수정 중...' : '회원정보 수정'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}