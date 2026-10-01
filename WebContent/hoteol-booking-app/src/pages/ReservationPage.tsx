import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ChevronLeft, MapPin, User, ShieldCheck } from 'lucide-react';
import { money } from '../data/stays';
import { Footer } from '../components/Footer';

interface ReservationState {
    roomId: number;
    roomTitle: string;
    pricePerNight: number;
    roomImage: string;
    stayTitle: string;
    stayAddr: string;
    checkIn?: string;
    checkOut?: string;
}

    export function ReservationPage() {
        const navigate = useNavigate();
        const location = useLocation();
        const roomState = location.state as ReservationState;

        const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
        const tomorrowStr = useMemo(() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d.toISOString().split('T')[0];
        }, []);

        // 💡 넘어온 날짜가 유효하면 해당 날짜를, 없으면 기본 오늘/내일 설정
        const [checkInDate, setCheckInDate] = useState(roomState?.checkIn || todayStr);
        const [checkOutDate, setCheckOutDate] = useState(roomState?.checkOut || tomorrowStr);
    const [guestName, setGuestName] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 전달된 객실 정보가 없으면 뒤로가기
    useEffect(() => {
        if (!roomState || !roomState.roomId) {
            alert('잘못된 접근입니다. 숙소를 먼저 선택해 주세요.');
            navigate(-1);
            return;
        }

        // 토큰에서 사용자 정보 파싱
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        try {
            const base64Payload = token.split('.')[1];
            const decoded = JSON.parse(
                decodeURIComponent(
                    atob(base64Payload)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                )
            );
            if (decoded.name) setGuestName(decoded.name);
        } catch {

        }
    }, [roomState, navigate]);

    // 박수(Nights) 계산
    const nights = useMemo(() => {
        if (!checkInDate || !checkOutDate) return 0;
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 ? diff : 0;
    }, [checkInDate, checkOutDate]);

    // 총 금액 계산
    const totalPrice = useMemo(() => {
        if (!roomState?.pricePerNight || nights <= 0) return 0;
        return roomState.pricePerNight * nights;
    }, [roomState, nights]);

    // 예약 제출 핸들러
    const handleSubmitReservation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (nights <= 0) {
            alert('체크아웃 날짜는 체크인 날짜 이후여야 합니다.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인 세션이 만료되었습니다.');
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            const requestBody = {
                roomId: roomState.roomId,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                totalPrice: totalPrice,
            };

            await axios.post('/api/reservations', requestBody, {
                headers: {
                    Authorization: `Bearer ${token}` // 이 헤더를 통해 백엔드가 22번 회원을 식별
                }
            });

            alert('예약이 성공적으로 완료되었습니다!');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || '예약 처리 중 오류가 발생했습니다. (잔여 객실 부족 등)';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!roomState) return null;

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#123f4d' }}>예약 및 결제</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '960px', margin: '32px auto', padding: '0 16px' }}>
                <form onSubmit={handleSubmitReservation} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>

                    {/* 좌측: 예약자 정보 및 일정 선택 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* 1. 일정 선택 카드 */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} color="#0f766e" /> 일정 선택
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                        체크인
                                    </label>
                                    <input
                                        type="date"
                                        min={todayStr}
                                        value={checkInDate}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                        체크아웃
                                    </label>
                                    <input
                                        type="date"
                                        min={checkInDate}
                                        value={checkOutDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#0f766e', fontWeight: 600 }}>
                                📅 총 {nights}박 {nights + 1}일 일정
                            </div>
                        </div>

                        {/* 2. 예약자 정보 카드 */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={18} color="#0f766e" /> 예약자 정보
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                        예약자 성함
                                    </label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="홍길동"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                        연락처
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="010-1234-5678"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 숙소 요약 및 결제 금액 안내 카드 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                            <h4 style={{ fontSize: '14px', color: '#0f766e', fontWeight: 700, margin: '0 0 6px 0' }}>숙소 정보</h4>
                            <strong style={{ fontSize: '18px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                                {roomState.stayTitle}
                            </strong>
                            <p style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 16px 0' }}>
                                <MapPin size={14} /> {roomState.stayAddr}
                            </p>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    {roomState.roomImage && (
                                        <img
                                            src={roomState.roomImage}
                                            alt={roomState.roomTitle}
                                            style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{roomState.roomTitle}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>1박 기준 {money(roomState.pricePerNight)}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                    <span>객실 요금 ({nights}박)</span>
                                    <span>{money(totalPrice)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>
                                    <span>최종 결제 금액</span>
                                    <span style={{ color: '#0f766e' }}>{money(totalPrice)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || nights <= 0}
                                style={{
                                    width: '100%',
                                    marginTop: '24px',
                                    padding: '14px 0',
                                    backgroundColor: '#123f4d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: submitting || nights <= 0 ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                {submitting ? '예약 처리 중...' : `${money(totalPrice)} 예약하기`}
                            </button>

                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                                <ShieldCheck size={14} color="#0f766e" /> 안전 결제 및 실시간 재고 보장
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}