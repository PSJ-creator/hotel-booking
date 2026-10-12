import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function KakaoCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('accessToken', token);
            alert('카카오 로그인에 성공했습니다!');
            navigate('/');
        } else {
            alert('로그인에 실패했습니다.');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>
            로그인 처리 중입니다. 잠시만 기다려주세요...
        </div>
    );
}