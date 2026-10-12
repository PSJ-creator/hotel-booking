import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
}

interface NotificationBellProps {
    userRole: string;
    isLoggedIn: boolean;
}

export function NotificationBell({ userRole, isLoggedIn }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const notiRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (isLoggedIn && (userRole === 'ROLE_HOST' || userRole === 'ROLE_ADMIN')) {
            const token = localStorage.getItem('accessToken');
            fetch('/api/v1/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => (res.ok ? res.json() : []))
                .then((data: NotificationItem[]) => {
                    const dismissed: string[] = JSON.parse(localStorage.getItem('dismissedNotiIds') || '[]');
                    const filtered = data.filter((item) => !dismissed.includes(item.id));
                    setNotifications(filtered);
                })
                .catch(() => setNotifications([]));
        }
    }, [isLoggedIn, userRole]);
    useEffect(() => {
        const handleClickOutsideNoti = (event: MouseEvent) => {
            if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
                setIsNotiOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideNoti);
        return () => document.removeEventListener('mousedown', handleClickOutsideNoti);
    }, []);
    const handleDeleteNoti = (id: string) => {
        const dismissed: string[] = JSON.parse(localStorage.getItem('dismissedNotiIds') || '[]');
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem('dismissedNotiIds', JSON.stringify(dismissed));
        }
        setNotifications((prev) => prev.filter((item) => item.id !== id));
    };
    if (!isLoggedIn || (userRole !== 'ROLE_HOST' && userRole !== 'ROLE_ADMIN')) {
        return null;
    }

    return (
        <div style={{ position: 'relative' }} ref={notiRef}>
            <button
                type="button"
                onClick={() => setIsNotiOpen((prev) => !prev)}
                style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #123f4d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#123f4d'
                }}
                aria-label="알림"
            >
                <Bell size={18} />

                {notifications.length > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '3px',
                            left: '3px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#e53e3e',
                            borderRadius: '50%',
                            border: '1.5px solid #ffffff'
                        }}
                    />
                )}
            </button>

            {isNotiOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '115%',
                        right: 0,
                        width: '300px',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e2e8f0',
                        padding: '12px',
                        zIndex: 1100
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                            paddingBottom: '6px',
                            borderBottom: '1px solid #f1f5f9'
                        }}
                    >
                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>알림 내역</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{notifications.length}건</span>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                            새로운 알림이 없습니다.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                            {notifications.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        backgroundColor: '#f8fafc',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        gap: '8px'
                                    }}
                                >
                                    <div>
                                        <p
                                            style={{
                                                margin: '0 0 3px 0',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: item.type === 'ACCOM_REJECT' ? '#e53e3e' : '#0f766e'
                                            }}
                                        >
                                            {item.title}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#475569', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                            {item.message}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteNoti(item.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            color: '#94a3b8'
                                        }}
                                        aria-label="알림 지우기"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}