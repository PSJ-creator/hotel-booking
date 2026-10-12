import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    onBack?: () => void;
    rightElement?: React.ReactNode;
    titleSize?: string;
}

export function PageHeader({
                               title,
                               onBack,
                               rightElement,
                               titleSize = '18px'
                           }: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <header
            style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}
        >
            <div
                className="container"
                style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => (onBack ? onBack() : navigate(-1))}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        aria-label="뒤로 가기"
                    >
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: titleSize, fontWeight: 700, color: '#123f4d' }}>
                        {title}
                    </span>
                </div>

                {rightElement && <div>{rightElement}</div>}
            </div>
        </header>
    );
}