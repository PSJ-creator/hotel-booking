import { useState, useEffect } from 'react';
import { Calendar, Users, Search, ArrowRight, Map as MapIcon } from 'lucide-react';

interface StaySearchBarProps {
    todayStr: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    query: string;
    onCheckInChange: (val: string) => void;
    onCheckOutChange: (val: string) => void;
    onGuestsChange: (val: number) => void;
    onQueryChange: (val: string) => void;
    onSearchSubmit: () => void;
    onMapSearch: () => void;
}

export function StaySearchBar({
                                  todayStr,
                                  checkIn,
                                  checkOut,
                                  guests,
                                  query,
                                  onCheckInChange,
                                  onCheckOutChange,
                                  onGuestsChange,
                                  onQueryChange,
                                  onSearchSubmit,
                                  onMapSearch
                              }: StaySearchBarProps) {
    const [isSearchPinned, setIsSearchPinned] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsSearchPinned(window.scrollY > 430);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section
            className={`search-wrap container ${isSearchPinned ? 'is-pinned' : ''}`}
            aria-label="숙소 검색"
        >
            <form
                className="search-panel"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSearchSubmit();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0' }}
            >
                {/* 1. 왼쪽 타이틀 영역 */}
                <div
                    className="search-heading"
                    style={{ minWidth: '165px', maxWidth: '175px', paddingRight: '14px', flexShrink: 0 }}
                >
                    <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>나에게 맞는 제주를 찾아보세요</span>
                    <strong style={{ fontSize: '17px', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
                        어디로 떠나볼까요?
                    </strong>
                </div>

                {/* 2. 일정 선택 필드 */}
                <div
                    className="search-field"
                    style={{
                        flex: '1.4',
                        minWidth: '260px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <Calendar size={20} color="#49717a" style={{ flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
                        <span style={{ fontSize: '12px', color: '#819296', fontWeight: 600 }}>일정</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
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
                                    minWidth: '105px'
                                }}
                            />
                            <span style={{ color: '#94a3b8', fontSize: '12px', flexShrink: 0 }}>~</span>
                            <input
                                type="date"
                                min={checkIn}
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
                                    minWidth: '105px'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. 인원 선택 필드 */}
                <label className="search-field" style={{ flex: '0.8', minWidth: '130px', padding: '8px 16px' }}>
                    <Users size={20} color="#49717a" style={{ flexShrink: 0 }} />
                    <span style={{ width: '100%' }}>
                        인원
                        <select
                            value={guests}
                            onChange={(e) => onGuestsChange(Number(e.target.value))}
                            style={{
                                display: 'block',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#17343d',
                                cursor: 'pointer',
                                padding: '4px 0 0',
                                width: '100%'
                            }}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                <option key={num} value={num}>성인 {num}명</option>
                            ))}
                        </select>
                    </span>
                </label>

                {/* 4. 검색어 필드 */}
                <label className="search-field keyword" style={{ flex: '1', minWidth: '150px', padding: '8px 16px' }}>
                    <Search size={20} color="#49717a" style={{ flexShrink: 0 }} />
                    <span style={{ width: '100%' }}>
                        검색어
                        <input
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder="숙소 또는 여행지"
                            style={{ width: '100%', fontSize: '14px', fontWeight: 600 }}
                        />
                    </span>
                </label>

                {/* 5. 검색 버튼 그룹 */}
                <div style={{ display: 'flex', gap: '8px', paddingLeft: '12px', flexShrink: 0 }}>
                    <button
                        className="search-button"
                        type="submit"
                        style={{ padding: '16px 20px', fontSize: '14px', gap: '10px' }}
                    >
                        숙소 검색 <ArrowRight size={16} />
                    </button>
                    <button
                        type="button"
                        className="search-button"
                        onClick={onMapSearch}
                        style={{
                            backgroundColor: '#0f766e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            padding: '16px 18px',
                            fontSize: '14px'
                        }}
                    >
                        <MapIcon size={17} />
                        지도 검색
                    </button>
                </div>
            </form>
        </section>
    );
}