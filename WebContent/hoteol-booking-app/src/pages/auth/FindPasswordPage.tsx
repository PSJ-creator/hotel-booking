import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { Footer } from '../../components/common/Footer.tsx';

export function FindPasswordPage() {
    const navigate = useNavigate();

    // 진행 단계 (1: 이메일 전송, 2: 인증코드 확인, 3: 새 비밀번호 설정)
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // 3분(180초) 타이머 관리
    const [timeLeft, setTimeLeft] = useState(180);

    useEffect(() => {
        let timer: number;
        if (step === 2 && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    // 초를 MM:SS 형식으로 변환
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // 💡 1단계: 인증코드 발송 (이벤트 타입 명시)
    const handleSendCode = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await axios.post('/api/v1/members/password/code', { email });
            setSuccessMessage('인증 코드가 이메일로 발송되었습니다. 3분 이내에 입력해 주세요.');
            setStep(2);
            setTimeLeft(180);
        } catch (err: any) {
            setErrorMessage(err.response?.data || '가입되지 않은 이메일이거나 발송에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 💡 2단계: 인증코드 검증 (이벤트 타입 명시)
    const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (timeLeft <= 0) {
            setErrorMessage('인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/v1/members/password/verify', { email, code });
            setSuccessMessage('이메일 인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.');
            setStep(3);
        } catch (err: any) {
            setErrorMessage(err.response?.data || '인증 코드가 올바르지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 💡 3단계: 비밀번호 재설정 (이벤트 타입 명시)
    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 4) {
            setErrorMessage('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/v1/members/password/reset', { email, newPassword });
            alert('비밀번호가 성공적으로 변경되었습니다! 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err: any) {
            setErrorMessage(err.response?.data || '비밀번호 변경 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }}>

            {/* 💡 왼쪽 상단 홈으로 가는 로고 링크 추가 */}
            <Link
                to="/"
                style={{
                    position: 'absolute',
                    top: '28px',
                    left: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: '#123f4d',
                    fontWeight: 800,
                    fontSize: '20px',
                    zIndex: 10
                }}
            >
                <img src="/favicon.png" alt="제주 야호 로고" style={{ width: '32px', height: '32px' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    제주 야호
                    <small style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700, letterSpacing: '0.05em' }}>
                        JEJU YA-HO
                    </small>
                </div>
            </Link>

            {/* 비밀번호 찾기 박스 중앙 정렬 래퍼 */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '420px', padding: '36px 32px', border: '1px solid #e2e8f0', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <KeyRound size={24} color="#0f766e" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>비밀번호 찾기</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                            {step === 1 && '가입 시 사용한 이메일 주소를 입력해 주세요.'}
                            {step === 2 && '메일로 발송된 6자리 인증 코드를 입력해 주세요.'}
                            {step === 3 && '새로 사용할 비밀번호를 입력해 주세요.'}
                        </p>
                    </div>

                    {/* 에러 및 안내 메시지 */}
                    {errorMessage && (
                        <div style={{ padding: '12px 14px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div style={{ padding: '12px 14px', backgroundColor: '#f0fdfa', color: '#0f766e', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #ccfbf1' }}>
                            {successMessage}
                        </div>
                    )}

                    {/* [1단계: 이메일 입력] */}
                    {step === 1 && (
                        <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    가입 이메일
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@jeju.com"
                                        style={{ width: '100%', padding: '12px 14px 12px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }}
                                    />
                                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '14px',
                                    backgroundColor: '#123f4d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? '인증 코드 발송 중...' : '인증 코드 받기'}
                            </button>
                        </form>
                    )}

                    {/* [2단계: 인증코드 입력] */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                        인증 코드 (6자리)
                                    </label>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: timeLeft <= 30 ? '#ef4444' : '#0f766e' }}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="123456"
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '18px', letterSpacing: '6px', textAlign: 'center', outline: 'none' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || timeLeft <= 0}
                                style={{
                                    padding: '14px',
                                    backgroundColor: '#123f4d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: loading || timeLeft <= 0 ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? '확인 중...' : '인증 확인'}
                            </button>

                            <button
                                type="button"
                                onClick={handleSendCode}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}
                            >
                                인증 코드가 오지 않았나요? 재전송하기
                            </button>
                        </form>
                    )}

                    {/* [3단계: 새 비밀번호 설정] */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    새 비밀번호
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="새 비밀번호 입력"
                                        style={{ width: '100%', padding: '12px 14px 12px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }}
                                    />
                                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    새 비밀번호 확인
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="새 비밀번호 다시 입력"
                                        style={{ width: '100%', padding: '12px 14px 12px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }}
                                    />
                                    <CheckCircle2 size={16} color="#94a3b8" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '14px',
                                    backgroundColor: '#123f4d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    marginTop: '8px'
                                }}
                            >
                                {loading ? '변경 중...' : '비밀번호 변경 완료'}
                            </button>
                        </form>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
                        비밀번호가 기억나셨나요? <Link to="/login" style={{ color: '#0f766e', fontWeight: 700, textDecoration: 'none', marginLeft: '6px' }}>로그인</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}