import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
    checkIn: string;
    checkOut: string;
    onChange: (checkIn: string, checkOut: string) => void;
}

export function DateRangePicker({ checkIn, checkOut, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectingStart, setSelectingStart] = useState<string | null>(null);
    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const [viewDate, setViewDate] = useState(() => {
        const d = checkIn ? new Date(checkIn) : new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });


    const pickerRef = useRef<HTMLDivElement>(null);
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSelectingStart(null);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };
    const handleDateClick = (dateStr: string) => {
        if (!selectingStart) {
            setSelectingStart(dateStr);
        } else {
            if (dateStr > selectingStart) {
                onChange(selectingStart, dateStr);
                setSelectingStart(null);
                setIsOpen(false);
            } else {
                setSelectingStart(dateStr);
            }
        }
    };
    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const s = new Date(checkIn);
        const e = new Date(checkOut);
        const diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 ? diff : 0;
    }, [checkIn, checkOut]);
    const renderCalendarMonth = (year: number, month: number) => {
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const activeStart = selectingStart || checkIn;
        const activeEnd = selectingStart ? (hoverDate || selectingStart) : checkOut;

        const cells = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            cells.push(<div key={`empty-${i}`} style={{ height: '36px' }} />);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isPast = dateStr < todayStr;
            const isStart = dateStr === activeStart;
            const isEnd = dateStr === activeEnd;
            const isInRange = activeStart && activeEnd && dateStr > activeStart && dateStr < activeEnd;

            cells.push(
                <button
                    key={dateStr}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDateClick(dateStr)}
                    onMouseEnter={() => selectingStart && setHoverDate(dateStr)}
                    style={{
                        height: '36px',
                        width: '100%',
                        border: 'none',
                        background: isStart || isEnd ? '#123f4d' : isInRange ? '#e6f4f1' : 'transparent',
                        color: isStart || isEnd ? '#ffffff' : isPast ? '#cbd5e1' : '#1e293b',
                        fontWeight: isStart || isEnd ? 700 : 500,
                        fontSize: '13px',
                        cursor: isPast ? 'not-allowed' : 'pointer',
                        borderRadius: isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s ease'
                    }}
                >
                    {d}
                </button>
            );
        }

        return (
            <div style={{ width: '260px' }}>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '15px', marginBottom: '14px', color: '#0f172a' }}>
                    {year}년 {month + 1}월
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
                    {cells}
                </div>
            </div>
        );
    };

    return (
        <div ref={pickerRef} style={{ position: 'relative', width: '100%' }}>
            {/* 1. 트리거 인풋 버튼 */}
            <div
                onClick={() => setIsOpen((prev) => !prev)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <Calendar size={20} color="#49717a" style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#819296', fontWeight: 600 }}>
                        일정 {nights > 0 && `(${nights}박)`}
                    </span>
                    <strong style={{ fontSize: '13px', color: '#17343d', marginTop: '2px' }}>
                        {checkIn ? checkIn.slice(5) : '체크인'} ~ {checkOut ? checkOut.slice(5) : '체크아웃'}
                    </strong>
                </div>
            </div>

            {/* 2. 팝업 모달창 (2개월 듀얼 뷰) */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 14px)',
                        left: 0,
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
                        border: '1px solid #e2e8f0',
                        padding: '24px 28px',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}
                >
                    {/* 상단 월 이동 네비게이션 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f766e' }}>
                            {selectingStart ? '체크아웃 날짜를 선택해 주세요' : '체크인 날짜를 선택해 주세요'}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <ChevronLeft size={16} color="#475569" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <ChevronRight size={16} color="#475569" />
                            </button>
                        </div>
                    </div>

                    {/* 달력 본체: 현재달 & 다음달 듀얼 렌더링 */}
                    <div style={{ display: 'flex', gap: '32px' }}>
                        {renderCalendarMonth(viewDate.getFullYear(), viewDate.getMonth())}
                        {renderCalendarMonth(
                            viewDate.getMonth() === 11 ? viewDate.getFullYear() + 1 : viewDate.getFullYear(),
                            (viewDate.getMonth() + 1) % 12
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}