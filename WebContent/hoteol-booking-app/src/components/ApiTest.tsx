import { useState, useEffect } from 'react';
//해당 컴포넌트는 예제용으로 차후 삭제 요망
interface ApiResponse {
    status: string;
    message: string;
    port: number;
}

export default function ApiTest() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/hello')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP 에러 발생: ${res.status}`);
                }
                return res.json();
            })
            .then((json: ApiResponse) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div
            style={{
                margin: '20px auto',
                maxWidth: '600px',
                padding: '20px',
                border: '1px solid #4caf50',
                borderRadius: '8px',
                backgroundColor: '#f1f8e9',
                fontFamily: 'sans-serif',
            }}
        >
            <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
                🔗 Spring Boot & React 연동 상태
            </h3>

            {loading && <p>데이터를 불러오는 중입니다...</p>}
            {error && <p style={{ color: '#d32f2f' }}>연동 오류: {error}</p>}

            {data && (
                <div style={{ lineHeight: '1.6' }}>
                    <p style={{ margin: '4px 0' }}><strong>상태:</strong> {data.status}</p>
                    <p style={{ margin: '4px 0' }}><strong>서버 메시지:</strong> {data.message}</p>
                    <p style={{ margin: '4px 0' }}><strong>응답 포트:</strong> {data.port}</p>
                </div>
            )}
        </div>
    );
}