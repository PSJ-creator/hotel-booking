import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Footer } from '../components/Footer';

export function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    // React strict mode에서 API가 두 번 호출되는 것을 막기 위한 방어 로직
    const isProcessed = useRef(false);

    useEffect(() => {
        if (isProcessed.current) return;
        isProcessed.current = true;

        // 1. 토스가 자동으로 넘겨주는 결제 검증 데이터
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        // 2. 우리가 결제 요청 시 붙여서 보냈던 객실 예약 데이터
        const roomId = searchParams.get('roomId');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');

        if (!paymentKey || !roomId || !amount) {
            setStatus('error');
            setErrorMessage('잘못된 접근입니다. 결제 정보가 누락되었습니다.');
            return;
        }

        const confirmPaymentAndReserve = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                // 새로운 PaymentConfirmRequest DTO 규격에 맞춤
                const requestBody = {
                    paymentKey: paymentKey,
                    orderId: orderId,
                    amount: Number(amount),
                    roomId: Number(roomId),
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                };

                // 💡 임시 예약 API 대신 새로 만든 진짜 결제 검증 API로 전송!
                await axios.post('/api/v1/payments/confirm', requestBody, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStatus('success');

            } catch (err: any) {
                console.error(err);
                setStatus('error');
                // 백엔드에서 날려준 에러 메시지(환불 완료 등)를 화면에 표시
                setErrorMessage(err.response?.data || '결제 및 예약 처리 중 오류가 발생했습니다.');
            }
        };

        confirmPaymentAndReserve();
    }, [searchParams]);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>

                    {status === 'loading' && (
                        <>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                            <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>결제 승인 중...</h2>
                            <p style={{ color: '#64748b', fontSize: '14px' }}>창을 닫거나 새로고침하지 마세요.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle2 size={56} color="#0f766e" style={{ margin: '0 auto 20px' }} />
                            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '12px' }}>결제 및 예약 완료!</h2>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                                안전하게 예약이 확정되었습니다.<br />
                                즐거운 제주 여행 되세요!
                            </p>
                            <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#123f4d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                                홈으로 돌아가기
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <AlertCircle size={56} color="#dc2626" style={{ margin: '0 auto 20px' }} />
                            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '12px' }}>예약 실패</h2>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px', wordBreak: 'keep-all' }}>
                                {errorMessage}
                            </p>
                            <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                                메인으로 돌아가기
                            </button>
                        </>
                    )}

                    {/* 스피너 CSS (간단한 인라인용) */}
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </main>
            <Footer />
        </div>
    );
}