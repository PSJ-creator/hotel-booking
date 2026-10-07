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

// 로컬(Vite 개발 서버 5173)에서는 스프링 백엔드 포트인 8080으로 지정하고,
// 서버 배포 환경에서는 현재 도메인(origin)의 8080 주소를 사용하도록 분기
const getRedirectUri = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8080/api/v1/auth/kakao/callback';
    }
    return `${window.location.origin}/api/v1/auth/kakao/callback`;
};

export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${getRedirectUri()}&response_type=code&prompt=login`;