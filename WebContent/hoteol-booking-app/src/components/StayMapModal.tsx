import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Stay } from '../types/stay';
import { KakaoStayMap } from './KakaoMap';

interface StayMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    stays: Stay[];
}

export function StayMapModal({ isOpen, onClose, stays }: StayMapModalProps) {
    // 1. 모달 활성화 시 배경 스크롤 방지
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
            onClick={onClose}
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
                onClick={(e) => e.stopPropagation()} // 내부 클릭 시 모달 닫힘 방지
            >
                {/* 닫기 (X) 버튼 */}
                <button
                    type="button"
                    onClick={onClose}
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
                        transition: 'background-color 0.2s',
                        zIndex: 10,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                >
                    <X size={20} />
                </button>

                {/* 2. 기존 홈페이지 section-top 헤더 영역 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '18px',
                        paddingRight: '48px', // X 버튼과 겹치지 않도록 여백
                    }}
                >
                    <div>
                        <span
                            className="eyebrow"
                            style={{
                                color: '#b45309',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            JEJU MAP GUIDE
                        </span>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                            제주, 어디로 갈까요?
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            마커나 클러스터를 클릭하면 숙소 정보와 1박 요금을 확인하고 바로 이동할 수 있습니다.
                        </p>
                    </div>

                    <span
                        style={{
                            color: '#0f766e',
                            fontWeight: 600,
                            backgroundColor: '#ccfbf1',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        실시간 등록 숙소 {stays.length}곳 탐색 가능
                    </span>
                </div>

                {/* 3. 지도 래퍼 카드 (모달 남은 높이를 꽉 채우도록 설정) */}
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        borderRadius: '18px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                    }}
                >
                    <KakaoStayMap stays={stays} level={9} height="100%" />
                </div>
            </div>
        </div>
    );
}