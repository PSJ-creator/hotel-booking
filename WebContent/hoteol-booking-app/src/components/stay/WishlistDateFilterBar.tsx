import React from 'react';
import { Calendar, Users, ArrowRight } from 'lucide-react';

interface WishlistDateFilterBarProps {
    todayStr: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    onCheckInChange: (val: string) => void;
    onCheckOutChange: (val: string) => void;
    onGuestsChange: (val: number) => void;
    onSearch: (e: React.FormEvent) => void;
}

export function WishlistDateFilterBar({
                                          todayStr,
                                          checkIn,
                                          checkOut,
                                          guests,
                                          onCheckInChange,
                                          onCheckOutChange,
                                          onGuestsChange,
                                          onSearch
                                      }: WishlistDateFilterBarProps) {
    return (
        <form
            onSubmit={onSearch}
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 18px',
                marginBottom: '28px',
                gap: '0',
            }}
        >
            <div style={{ minWidth: '150px', paddingRight: '14px', borderRight: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700, display: 'block' }}>
                    찜한 숙소 모아보기
                </span>
                <strong style={{ fontSize: '15px', color: '#17343d', letterSpacing: '-0.3px' }}>
                    일정으로 찾기
                </strong>
            </div>

            <div style={{ flex: '1.4', minWidth: '250px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={19} color="#49717a" style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <span style={{ fontSize: '11px', color: '#819296', fontWeight: 600 }}>일정</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <input
                            type="date"
                            min={todayStr}
                            value={checkIn}
                            onClick={(e) => (e.currentTarget as any).showPicker?.()}
                            onChange={(e) => {
                                const nextIn = e.target.value;
                                onCheckInChange(nextIn);
                                if (nextIn >= checkOut) {
                                    const nextD = new Date(nextIn);
                                    nextD.setDate(nextD.getDate() + 1);
                                    onCheckOutChange(nextD.toISOString().split('T')[0]);
                                }
                            }}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#17343d',
                                padding: 0,
                                cursor: 'pointer',
                                flex: 1,
                            }}
                        />
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>~</span>
                        <input
                            type="date"
                            min={checkIn || todayStr}
                            value={checkOut}
                            onClick={(e) => (e.currentTarget as any).showPicker?.()}
                            onChange={(e) => onCheckOutChange(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#17343d',
                                padding: 0,
                                cursor: 'pointer',
                                flex: 1,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ flex: '0.8', minWidth: '120px', padding: '0 16px', borderLeft: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={19} color="#49717a" style={{ flexShrink: 0 }} />
                <div style={{ width: '100%' }}>
                    <span style={{ fontSize: '11px', color: '#819296', fontWeight: 600, display: 'block' }}>인원</span>
                    <select
                        value={guests}
                        onChange={(e) => onGuestsChange(Number(e.target.value))}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#17343d',
                            cursor: 'pointer',
                            width: '100%',
                            padding: '2px 0 0 0',
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <option key={num} value={num}>성인 {num}명</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                style={{
                    backgroundColor: '#123f4d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px 22px',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    marginLeft: '8px',
                }}
            >
                일정 검색 <ArrowRight size={16} />
            </button>
        </form>
    );
}