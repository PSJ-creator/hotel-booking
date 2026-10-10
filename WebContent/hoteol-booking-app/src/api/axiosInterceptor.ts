import axios from 'axios';

export function setupAxiosInterceptors() {
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');
            if (token && !config.url?.includes('/auth/refresh')) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (
                error.response?.status === 401 &&
                !originalRequest.url?.includes('/auth/refresh') &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true;

                // HttpOnly 쿠키에 담겨있으므로, axios가 요청 시 자동으로(withCredentials) 쿠키를 서버로 보냅니다.
                try {
                    // 백엔드에 토큰 재발급 요청 (이때 HttpOnly 쿠키가 자동으로 넘어감)
                    const res = await axios.post('/api/v1/auth/refresh', {}, {
                        withCredentials: true // 💡 쿠키를 포함해서 보내기 위한 필수 설정
                    });

                    // 백엔드는 새로운 Access Token만 JSON으로 주고,
                    // 새로운 Refresh Token은 다시 새로운 HttpOnly 쿠키로 구워줍니다.
                    const newAccessToken = res.data.token;

                    // 프론트엔드는 오직 Access Token만 로컬 스토리지에 저장합니다.
                    localStorage.setItem('accessToken', newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);

                } catch (refreshError) {
                    localStorage.removeItem('accessToken');

                    alert('안전한 이용을 위해 다시 로그인해 주세요.');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
}