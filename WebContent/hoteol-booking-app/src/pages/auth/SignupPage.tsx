import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {requestSignup, KAKAO_AUTH_URL} from '../../api/auth.ts'; // KAKAO_AUTH_URL 추가
import axios from 'axios';
import {Footer} from "../../components/common/Footer.tsx";

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
        <>
            <div style={{
                maxWidth: '420px',
                margin: '60px auto',
                padding: '32px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: '#fff'
            }}>
                <h2 style={{textAlign: 'center', marginBottom: '8px', color: '#123f4d'}}>회원가입</h2>
                <p style={{textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '24px'}}>제주 야호에 오신 것을
                    환영합니다.</p>

                {/* 카카오 간편 회원가입/로그인 버튼 */}
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
                    카카오로 3초 만에 시작하기
                </button>

                <div style={{display: 'flex', alignItems: 'center', margin: '16px 0', color: '#aaa', fontSize: '13px'}}>
                    <div style={{flex: 1, height: '1px', backgroundColor: '#eee'}}/>
                    <span style={{padding: '0 10px'}}>또는 이메일로 가입</span>
                    <div style={{flex: 1, height: '1px', backgroundColor: '#eee'}}/>
                </div>

                {errorMessage && (
                    <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#fde8e8',
                        color: '#e02424',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '16px'
                    }}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginBottom: '6px'
                        }}>이메일</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@jeju.com"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginBottom: '6px'
                        }}>비밀번호</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 입력"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px'}}>비밀번호
                            확인</label>
                        <input
                            type="password"
                            required
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="비밀번호 재입력"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginBottom: '6px'
                        }}>이름</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{marginTop: '4px'}}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={isHost}
                                onChange={(e) => setIsHost(e.target.checked)}
                            />
                            호스트(숙소 운영자)로 가입하기
                        </label>
                    </div>

                    {isHost && (
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                marginBottom: '6px'
                            }}>사업자등록번호</label>
                            <input
                                type="text"
                                required={isHost}
                                value={businessNo}
                                onChange={(e) => setBusinessNo(e.target.value)}
                                placeholder="000-00-00000"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#123f4d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? '가입 처리 중...' : '회원가입 완료'}
                    </button>
                </form>

                <div style={{textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666'}}>
                    이미 계정이 있으신가요? <Link to="/login"
                                        style={{color: '#123f4d', fontWeight: 600, textDecoration: 'none'}}>로그인하기</Link>
                </div>
            </div>
            <Footer/>
        </>
    );
}