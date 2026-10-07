import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestSignup, KAKAO_AUTH_URL } from '../../api/auth.ts';
import axios from 'axios';
import { Footer } from "../../components/common/Footer.tsx";

export function SignupPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [businessNo, setBusinessNo] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // 💡 폼 이벤트 경고 방지를 위해 <HTMLFormElement> 추가
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (password !== passwordConfirm) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (isHost && !businessNo.trim()) {
            setErrorMessage('호스트 회원은 사업자등록번호를 입력해야 합니다.');
            return;
        }

        setLoading(true);

        try {
            await requestSignup({
                email,
                password,
                name,
                businessNo: isHost ? businessNo.trim() : null,
            });

            alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setErrorMessage(err.response.data?.message || '회원가입 처리 중 오류가 발생했습니다.');
            } else {
                setErrorMessage('서버와 통신할 수 없습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
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

            {/* 회원가입 박스 중앙 정렬 래퍼 */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '420px', padding: '36px 32px', border: '1px solid #e2e8f0', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                    <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px' }}>회원가입</h2>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '28px', marginTop: 0 }}>제주 야호에 오신 것을 환영합니다.</p>

                    {/* 카카오 간편 회원가입/로그인 버튼 */}
                    <button
                        type="button"
                        onClick={handleKakaoLogin}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#FEE500',
                            color: '#000000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '24px'
                        }}
                    >
                        카카오로 3초 만에 시작하기
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: '#94a3b8', fontSize: '13px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                        <span style={{ padding: '0 12px' }}>또는 이메일로 가입</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                    </div>

                    {errorMessage && (
                        <div style={{ padding: '12px 14px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>이메일</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@jeju.com"
                                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>비밀번호</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>비밀번호 확인</label>
                            <input
                                type="password"
                                required
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                placeholder="비밀번호 재입력"
                                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>이름</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="홍길동"
                                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginTop: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#334155', fontWeight: 500 }}>
                                <input
                                    type="checkbox"
                                    checked={isHost}
                                    onChange={(e) => setIsHost(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                호스트(숙소 운영자)로 가입하기
                            </label>
                        </div>

                        {isHost && (
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>사업자등록번호</label>
                                <input
                                    type="text"
                                    required={isHost}
                                    value={businessNo}
                                    onChange={(e) => setBusinessNo(e.target.value)}
                                    placeholder="000-00-00000"
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '8px',
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
                            {loading ? '가입 처리 중...' : '회원가입 완료'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
                        이미 계정이 있으신가요? <Link to="/login" style={{ color: '#0f766e', fontWeight: 700, textDecoration: 'none', marginLeft: '6px' }}>로그인하기</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}