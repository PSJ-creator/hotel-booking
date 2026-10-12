import { useEffect, useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import type { TourSummary } from '../../api/tours.ts';
import { KakaoTourMap } from './KakaoTourMap.tsx';

interface TourMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    tours: TourSummary[];
    storageKeyPrefix?: string;
}

export function TourMapModal({
                                 isOpen,
                                 onClose,
                                 tours,
                                 storageKeyPrefix = 'home_tour_map'
                             }: TourMapModalProps) {
    const keywordStorageKey = `${storageKeyPrefix}_keyword`;
    const viewStorageKey = `${storageKeyPrefix}_view`;
    const [keyword, setKeyword] = useState<string>(() => {
        return sessionStorage.getItem(keywordStorageKey) || '';
    });
    useEffect(() => {
        sessionStorage.setItem(keywordStorageKey, keyword);
    }, [keyword, keywordStorageKey]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    const handleExplicitClose = () => {
        sessionStorage.removeItem(keywordStorageKey);
        sessionStorage.removeItem(viewStorageKey);
        setKeyword('');
        onClose();
    };

    const filteredTours = useMemo(() => {
        if (!keyword.trim()) return tours;
        const kw = keyword.trim().toLowerCase();
        return tours.filter(
            (t) =>
                t.title?.toLowerCase().includes(kw) ||
                t.addr1?.toLowerCase().includes(kw) ||
                t.addr2?.toLowerCase().includes(kw)
        );
    }, [tours, keyword]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
            onClick={handleExplicitClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '1100px',
                    height: '85vh',
                    maxHeight: '780px',
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                    padding: '28px',
                    position: 'relative',
                    boxSizing: 'border-box',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={handleExplicitClose}
                    aria-label="닫기"
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        background: '#f1f5f9',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}
                >
                    <X size={20} />
                </button>

                {/* 상단 헤더 및 검색바 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '18px',
                        paddingRight: '48px',
                    }}
                >
                    <div>
                        <span
                            style={{
                                color: '#0f766e',
                                fontSize: '12px',
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            JEJU TOUR ATTRACTION MAP
                        </span>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                            제주 관광 지도
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            지도 위의 마커를 클릭하면 관광지 사진과 정보를 확인하고 상세페이지로 이동할 수 있습니다.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="관광지명 또는 지역 검색"
                                style={{
                                    padding: '8px 14px 8px 34px',
                                    borderRadius: '20px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '13px',
                                    outline: 'none',
                                    width: '210px',
                                }}
                            />
                            <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                        </div>

                        <span
                            style={{
                                color: '#0f766e',
                                fontWeight: 700,
                                backgroundColor: '#ccfbf1',
                                padding: '7px 14px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            관광명소 {filteredTours.length}곳 표시 중
                        </span>
                    </div>
                </div>

                {/* 지도 영역 (💡 상세보기로 이동할 때 onClose를 호출하지 않으므로 뒤로가기 시 그대로 열려 있음!) */}
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        borderRadius: '18px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                    }}
                >
                    <KakaoTourMap
                        tours={filteredTours}
                        level={9}
                        height="100%"
                        mode="search"
                        storageKey={viewStorageKey}
                    />
                </div>
            </div>
        </div>
    );
}