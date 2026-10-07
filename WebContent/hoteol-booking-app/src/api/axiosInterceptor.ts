import axios from 'axios';

export function setupAxiosInterceptors() {
    // 1. 요청(Request) 가로채기: 통신을 보낼 때마다 헤더에 Access Token 자동 삽입
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');

            // 재발급 요청이 아닐 때만 기존 토큰 세팅
            if (token && !config.url?.includes('/auth/refresh')) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 2. 응답(Response) 가로채기: 401 에러 발생 시 Refresh Token으로 자동 갱신
    axios.interceptors.response.use(
        (response) => response, // 성공한 응답은 그냥 통과
        async (error) => {
            const originalRequest = error.config;

            // 에러가 401(권한 없음)이고, 재발급 API 자체 에러가 아니며, 아직 재시도한 적이 없다면!
            if (
                error.response?.status === 401 &&
                !originalRequest.url?.includes('/auth/refresh') &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true; // 무한 루프 방지용 플래그 꽂기

                const refreshToken = localStorage.getItem('refreshToken');

                // 리프레시 토큰조차 없다면 얄짤없이 쫓아냄
                if (!refreshToken) {
                    localStorage.removeItem('accessToken');
                    alert('로그인이 필요합니다.');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                try {
                    // 💡 조용히 백엔드에 토큰 재발급 요청
                    const res = await axios.post('/api/v1/auth/refresh', { refreshToken });

                    // 새로 발급받은 토큰들 저장
                    const newAccessToken = res.data.token;
                    const newRefreshToken = res.data.refreshToken;

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // 💡 아까 실패했던 억울한 요청의 헤더를 새 토큰으로 교체 후 다시 실행! (핵심)
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);

                } catch (refreshError) {
                    // 리프레시 토큰마저 만료되었거나 털린 경우 -> 완전 로그아웃
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    alert('안전한 이용을 위해 다시 로그인해 주세요.');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error); // 401이 아니거나 다른 에러면 그대로 에러 발생
        }
    );
}