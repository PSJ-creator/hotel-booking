import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface LocationMapPopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    eyebrow?: string;
    title: string;
    children: React.ReactNode;
}

export function LocationMapPopupModal({
                                          isOpen,
                                          onClose,
                                          eyebrow = 'LOCATION MAP',
                                          title,
                                          children
                                      }: LocationMapPopupModalProps) {
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
                padding: '24px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '1000px',
                    height: '82vh',
                    maxHeight: '740px',
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                    position: 'relative',
                    boxSizing: 'border-box'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f766e', display: 'block', marginBottom: '2px' }}>
                            {eyebrow}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                            {title} 위치 안내
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                            마우스 휠 또는 우측 하단 +/- 버튼으로 지도를 자유롭게 확대·축소할 수 있습니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, minHeight: 0, borderRadius: '16px', overflow: 'hidden' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}