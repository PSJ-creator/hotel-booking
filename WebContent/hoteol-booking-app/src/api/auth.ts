import axios from 'axios';

export interface SignupPayload {
    email: string;
    password: string;
    name: string;
    businessNo?: string | null;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface TokenResponse {
    token: string;
    refreshToken: string;
}

// 회원가입
export const requestSignup = async (payload: SignupPayload): Promise<string> => {
    const response = await axios.post<string>('/api/v1/auth/signup', payload);
    return response.data;
};

// 일반 로그인
export const requestLogin = async (payload: LoginPayload): Promise<TokenResponse> => {
    const response = await axios.post<TokenResponse>('/api/v1/auth/login', payload);
    return response.data;
};

// 카카오 로그인 인증창 URL
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;

const getRedirectUri = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8080/api/v1/auth/kakao/callback';
    }
    return `${window.location.origin}/api/v1/auth/kakao/callback`;
};

export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${getRedirectUri()}&response_type=code&prompt=login`;

// ⭐️ [누락되었던 부분 추가] 숙소 관리자(호스트) 신청 API
export const requestApplyHost = async (businessNo: string): Promise<TokenResponse> => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post<TokenResponse>(
        '/api/v1/auth/apply-host',
        { businessNo },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};