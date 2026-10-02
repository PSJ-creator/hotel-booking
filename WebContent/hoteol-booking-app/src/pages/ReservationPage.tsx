import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, MapPin, User, ShieldCheck } from 'lucide-react';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { money } from '../data/stays';
import { Footer } from '../components/Footer';

// 💡 테스트 클라이언트 키
const TOSS_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

interface ReservationState {
    roomId: number;
    roomTitle: string;
    pricePerNight: number;
    roomImage: string;
    stayTitle: string;
    stayAddr: string;
}

export function ReservationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const roomState = location.state as ReservationState;

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const tomorrowStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }, []);

    const [checkInDate, setCheckInDate] = useState(todayStr);
    const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
    const [guestName, setGuestName] = useState('');
    const [phone, setPhone] = useState('');

    // 💡 토스페이먼츠 위젯 상태 관리
    const paymentWidgetRef = useRef<Awaited<ReturnType<typeof loadPaymentWidget>> | null>(null);
    const paymentMethodsWidgetRef = useRef<any>(null);

    useEffect(() => {
        if (!roomState || !roomState.roomId) {
            alert('잘못된 접근입니다. 숙소를 먼저 선택해 주세요.');
            navigate(-1);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        try {
            const base64Payload = token.split('.')[1];
            const decoded = JSON.parse(decodeURIComponent(atob(base64Payload).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
            if (decoded.name) setGuestName(decoded.name);
        } catch {}
    }, [roomState, navigate]);

    const nights = useMemo(() => {
        if (!checkInDate || !checkOutDate) return 0;
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 ? diff : 0;
    }, [checkInDate, checkOutDate]);

    const totalPrice = useMemo(() => {
        if (!roomState?.pricePerNight || nights <= 0) return 0;
        return roomState.pricePerNight * nights;
    }, [roomState, nights]);

    // 💡 토스 결제 위젯 렌더링 로직
    useEffect(() => {
        (async () => {
            // 회원 식별자(고객 ID)를 랜덤 생성하거나 이메일을 해싱해서 넣습니다 (여기서는 랜덤)
            const customerKey = "customer_" + new Date().getTime();
            const paymentWidget = await loadPaymentWidget(TOSS_CLIENT_KEY, customerKey);

            // 결제 수단 위젯 렌더링
            const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                "#payment-widget",
                { value: totalPrice },
                { variantKey: "DEFAULT" }
            );

            // 약관 동의 위젯 렌더링
            paymentWidget.renderAgreement('#agreement', { variantKey: "AGREEMENT" });

            paymentWidgetRef.current = paymentWidget;
            paymentMethodsWidgetRef.current = paymentMethodsWidget;
        })();
    }, []);

    // 💡 결제 금액이 바뀔 때 위젯 업데이트
    useEffect(() => {
        const paymentMethodsWidget = paymentMethodsWidgetRef.current;
        if (paymentMethodsWidget) {
            paymentMethodsWidget.updateAmount(totalPrice);
        }
    }, [totalPrice]);

    // 💡 결제 요청 로직 (기존 DB 저장 로직 대신 실행됨)
    const handlePaymentRequest = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (nights <= 0) {
            alert('체크아웃 날짜는 체크인 날짜 이후여야 합니다.');
            return;
        }

        const paymentWidget = paymentWidgetRef.current;
        try {
            // 결제창 띄우기!
            await paymentWidget?.requestPayment({
                orderId: `ORDER_${new Date().getTime()}`, // 고유 주문번호 생성
                orderName: `${roomState.stayTitle} - ${roomState.roomTitle}`, // 결제창에 보일 상품명
                customerName: guestName,
                customerEmail: "customer@example.com",
                successUrl: `${window.location.origin}/payment/success?roomId=${roomState.roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}`, // 성공 시 리다이렉트 될 주소
                failUrl: `${window.location.origin}/payment/fail`, // 실패 시 리다이렉트 될 주소
            });
        } catch (err) {
            console.error('결제 실패:', err);
        }
    };

    if (!roomState) return null;

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#123f4d' }}>예약 및 결제</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '960px', margin: '32px auto', padding: '0 16px' }}>
                <form onSubmit={handlePaymentRequest} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>

                    {/* 좌측: 기존과 동일한 예약자 정보 및 일정 선택 영역 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} color="#0f766e" /> 일정 선택
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>체크인</label>
                                    <input type="date" min={todayStr} value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>체크아웃</label>
                                    <input type="date" min={checkInDate} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} required />
                                </div>
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#0f766e', fontWeight: 600 }}>📅 총 {nights}박 {nights + 1}일 일정</div>
                        </div>

                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={18} color="#0f766e" /> 예약자 정보
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>예약자 성함</label>
                                    <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="홍길동" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>연락처</label>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 숙소 요약 및 💡 결제 위젯 영역 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                            <h4 style={{ fontSize: '14px', color: '#0f766e', fontWeight: 700, margin: '0 0 6px 0' }}>숙소 정보</h4>
                            <strong style={{ fontSize: '18px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>{roomState.stayTitle}</strong>
                            <p style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 16px 0' }}><MapPin size={14} /> {roomState.stayAddr}</p>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    {roomState.roomImage && <img src={roomState.roomImage} alt={roomState.roomTitle} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />}
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{roomState.roomTitle}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>1박 기준 {money(roomState.pricePerNight)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 💡 토스페이먼츠 UI가 들어갈 자리 */}
                            <div id="payment-widget" style={{ margin: '10px -10px' }} />
                            <div id="agreement" style={{ margin: '0 -10px 10px -10px' }} />

                            <button type="submit" disabled={nights <= 0} style={{ width: '100%', marginTop: '8px', padding: '14px 0', backgroundColor: '#123f4d', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: nights <= 0 ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
                                {money(totalPrice)} 안전 결제하기
                            </button>
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}><ShieldCheck size={14} color="#0f766e" /> 안전 결제 및 실시간 재고 보장</div>
                        </div>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}