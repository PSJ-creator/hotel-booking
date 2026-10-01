import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { Footer } from '../components/Footer';

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

    // 1단계: 인증코드 발송
    const handleSendCode = async (e: React.FormEvent) => {
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

    // 2단계: 인증코드 검증
    const handleVerifyCode = async (e: React.FormEvent) => {
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

    // 3단계: 비밀번호 재설정
    const handleResetPassword = async (e: React.FormEvent) => {
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
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '420px', width: '100%', margin: '60px auto', padding: '32px', border: '1px solid #e0e0e0', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <KeyRound size={24} color="#0f766e" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#123f4d', margin: '0 0 6px 0' }}>비밀번호 찾기</h2>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        {step === 1 && '가입 시 사용한 이메일 주소를 입력해 주세요.'}
                        {step === 2 && '메일로 발송된 6자리 인증 코드를 입력해 주세요.'}
                        {step === 3 && '새로 사용할 비밀번호를 입력해 주세요.'}
                    </p>
                </div>

                {/* 에러 및 안내 메시지 */}
                {errorMessage && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fde8e8', color: '#e02424', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
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
                                    style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
                                />
                                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px',
                                backgroundColor: '#123f4d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
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
                                <span style={{ fontSize: '13px', fontWeight: 700, color: timeLeft <= 30 ? '#dc2626' : '#0f766e' }}>
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
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '16px', letterSpacing: '4px', textAlign: 'center' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || timeLeft <= 0}
                            style={{
                                padding: '12px',
                                backgroundColor: '#123f4d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: loading || timeLeft <= 0 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? '확인 중...' : '인증 확인'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendCode}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
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
                                    style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
                                />
                                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '12px' }} />
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
                                    style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
                                />
                                <CheckCircle2 size={16} color="#94a3b8" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px',
                                backgroundColor: '#123f4d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? '변경 중...' : '비밀번호 변경 완료'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#666' }}>
                    비밀번호가 기억나셨나요? <Link to="/login" style={{ color: '#123f4d', fontWeight: 600, textDecoration: 'none' }}>로그인</Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}