import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    User,
    ChevronDown,
    Heart,
    Map as MapIcon,
    CalendarCheck,
    Settings,
    LogOut,
    Home,
    MessageSquare,
    ShieldAlert,
    FileCheck,
    PlusCircle,
    Users
} from 'lucide-react';
import { WeatherWidget} from "../common/WeatherWidget.tsx";
import { NotificationBell} from "../common/NotificationBell.tsx";

interface HomeNavbarProps {
    isLoggedIn: boolean;
    onLogout: () => void;
    onOpenTourMap: () => void;
}

export function HomeNavbar({ isLoggedIn, onLogout, onOpenTourMap }: HomeNavbarProps) {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userName, setUserName] = useState('내 계정');
    const [userRole, setUserRole] = useState('ROLE_USER');
    const [hasApprovedAccommodation, setHasApprovedAccommodation] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 토큰 기반 닉네임 및 권한 파싱
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && isLoggedIn) {
            try {
                const base64Payload = token.split('.')[1];
                const decodedPayload = JSON.parse(
                    decodeURIComponent(
                        atob(base64Payload)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    )
                );
                if (decodedPayload.name) {
                    setUserName(decodedPayload.name);
                } else if (decodedPayload.sub) {
                    setUserName(decodedPayload.sub.split('@')[0]);
                }
                if (decodedPayload.role) {
                    setUserRole(decodedPayload.role);
                }
            } catch {
                setUserName('Unknown');
            }
        }
    }, [isLoggedIn]);

    // 호스트 계정 승인 숙소 보유 여부 체크
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && isLoggedIn && userRole === 'ROLE_HOST') {
            fetch('/api/v1/accommodations/has-approved', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => (res.ok ? res.json() : false))
                .then((data: boolean) => setHasApprovedAccommodation(data))
                .catch(() => setHasApprovedAccommodation(false));
        }
    }, [isLoggedIn, userRole]);

    // 드롭다운 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDummyClick = (menuName: string) => {
        alert(`[${menuName}] 기능은 준비 중입니다.`);
        setIsDropdownOpen(false);
    };

    const handleLogoutClick = () => {
        setIsDropdownOpen(false);
        onLogout();
    };

    return (
        <header className="header">
            <div className="nav container">
                <a className="brand" href="#top" aria-label="제주 야호 홈">
                    <img className="brand-mark" src="/favicon.png" alt="제주 야호 심볼" />
                    <span>
                        제주 야호<small>JEJU YA-HO</small>
                    </span>
                </a>

                <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                    <a href="#destinations" style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
                        추천 숙소
                    </a>
                    <a href="#travel" style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
                        추천 관광지
                    </a>
                    <button
                        type="button"
                        onClick={onOpenTourMap}
                        style={{
                            background: 'none',
                            border: 'none',
                            font: 'inherit',
                            color: 'inherit',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            lineHeight: 1,
                            verticalAlign: 'middle'
                        }}
                    >
                        관광 지도
                    </button>
                    <WeatherWidget />
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <a className="nav-cta" href="#stays">
                        제주 숙소 둘러보기 <ArrowRight size={16} />
                    </a>

                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative' }} ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 14px',
                                        backgroundColor: '#ffffff',
                                        border: '1.5px solid #123f4d',
                                        borderRadius: '24px',
                                        cursor: 'pointer',
                                        color: '#123f4d',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                    }}
                                >
                                    <div style={{
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '50%',
                                        backgroundColor: '#123f4d',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <User size={16} />
                                    </div>
                                    <span>{userName}</span>

                                    {userRole === 'ROLE_HOST' && (
                                        <span style={{
                                            fontSize: '11px',
                                            backgroundColor: '#e6f4ea',
                                            color: '#137333',
                                            padding: '2px 7px',
                                            borderRadius: '10px',
                                            fontWeight: 500
                                        }}>
                                            숙소관리자(파트너)
                                        </span>
                                    )}
                                    {userRole === 'ROLE_ADMIN' && (
                                        <span style={{
                                            fontSize: '11px',
                                            backgroundColor: '#fce8e6',
                                            color: '#c5221f',
                                            padding: '2px 7px',
                                            borderRadius: '10px',
                                            fontWeight: 500
                                        }}>
                                            총괄 관리자
                                        </span>
                                    )}

                                    <ChevronDown size={14} style={{
                                        transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                                        transition: '0.2s'
                                    }} />
                                </button>

                                {isDropdownOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '115%',
                                            right: 0,
                                            width: '210px',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                            border: '1px solid #f0f0f0',
                                            padding: '8px 0',
                                            zIndex: 1000,
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        {userRole === 'ROLE_USER' && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/wishlist');
                                                    }}
                                                    style={dropdownItemStyle}
                                                >
                                                    <Heart size={16} /> 숙소 위시리스트
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/tour-wishlist');
                                                    }}
                                                    style={dropdownItemStyle}
                                                >
                                                    <MapIcon size={16} /> 관광지 위시리스트
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/my-reservations');
                                                    }}
                                                    style={dropdownItemStyle}
                                                >
                                                    <CalendarCheck size={16} /> 예매한 숙소 조회
                                                </button>
                                            </>
                                        )}

                                        {userRole === 'ROLE_HOST' && (
                                            <>
                                                {hasApprovedAccommodation ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsDropdownOpen(false);
                                                                navigate('/host/reservations');
                                                            }}
                                                            style={dropdownItemStyle}
                                                        >
                                                            <CalendarCheck size={16} /> 예약 내역 관리
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsDropdownOpen(false);
                                                                navigate('/host/accommodation');
                                                            }}
                                                            style={dropdownItemStyle}
                                                        >
                                                            <Home size={16} /> 숙소 관리
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsDropdownOpen(false);
                                                                navigate('/host/reviews');
                                                            }}
                                                            style={dropdownItemStyle}
                                                        >
                                                            <MessageSquare size={16} /> 리뷰 관리
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            navigate('/host/accommodation');
                                                        }}
                                                        style={{
                                                            ...dropdownItemStyle,
                                                            color: '#0d9488',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        <PlusCircle size={16} /> 숙소 신청 / 관리
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {userRole === 'ROLE_ADMIN' && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDummyClick('사이트 관리')}
                                                    style={dropdownItemStyle}
                                                >
                                                    <ShieldAlert size={16} /> 사이트 관리
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDummyClick('파트너 관리')}
                                                    style={dropdownItemStyle}
                                                >
                                                    <Users size={16} /> 파트너 관리
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        navigate('/admin/accommodations');
                                                    }}
                                                    style={{
                                                        ...dropdownItemStyle,
                                                        color: '#c5221f',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    <FileCheck size={16} /> 신규 숙소 심사
                                                </button>
                                            </>
                                        )}

                                        <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '6px 0' }} />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/profile');
                                            }}
                                            style={dropdownItemStyle}
                                        >
                                            <Settings size={16} /> 회원정보 수정
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleLogoutClick}
                                            style={{ ...dropdownItemStyle, color: '#e53e3e' }}
                                        >
                                            <LogOut size={16} /> 로그아웃
                                        </button>
                                    </div>
                                )}
                            </div>

                            <NotificationBell userRole={userRole} isLoggedIn={isLoggedIn} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link
                                to="/login"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#123f4d',
                                    textDecoration: 'none',
                                    padding: '7px 14px',
                                    borderRadius: '6px',
                                    backgroundColor: '#f5f5f5',
                                }}
                            >
                                로그인
                            </Link>
                            <Link
                                to="/signup"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    backgroundColor: '#123f4d',
                                    textDecoration: 'none',
                                    padding: '7px 14px',
                                    borderRadius: '6px',
                                }}
                            >
                                회원가입
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

const dropdownItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 500,
    color: '#333333',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
};