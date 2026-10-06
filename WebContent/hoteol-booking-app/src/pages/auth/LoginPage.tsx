import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestLogin, KAKAO_AUTH_URL } from '../../api/auth.ts';
import axios from 'axios';
import {Footer} from "../../components/common/Footer.tsx";

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const data = await requestLogin({ email, password });
            // JWT 토큰 저장
            localStorage.setItem('accessToken', data.token);
            alert('로그인되었습니다!');
            navigate('/');
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setErrorMessage(err.response.data?.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
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
        <>
        <div style={{ maxWidth: '420px', margin: '60px auto', padding: '32px', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#123f4d' }}>로그인</h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '24px' }}>제주 야호 서비스를 이용해보세요.</p>

            {/* 카카오 로그인 버튼 */}
            <button
                type="button"
                onClick={handleKakaoLogin}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#FEE500',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                }}
            >
                카카오로 시작하기
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: '#aaa', fontSize: '13px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }} />
                <span style={{ padding: '0 10px' }}>또는 이메일로 로그인</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }} />
            </div>

            {errorMessage && (
                <div style={{ padding: '10px 14px', backgroundColor: '#fde8e8', color: '#e02424', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>이메일</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@jeju.com"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>비밀번호</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호 입력"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '10px',
                        padding: '12px',
                        backgroundColor: '#123f4d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? '로그인 중...' : '로그인'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' }}>
                아직 계정이 없으신가요? <Link to="/signup" style={{ color: '#123f4d', fontWeight: 600, textDecoration: 'none' }}>회원가입</Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#666' }}>
                비밀번호를 잊으셨나요? <Link to="/find-password" style={{ color: '#123f4d', fontWeight: 600, textDecoration: 'none' }}>비밀번호 찾기</Link>
            </div>
        </div>
            <Footer/>
        </>
    );
}