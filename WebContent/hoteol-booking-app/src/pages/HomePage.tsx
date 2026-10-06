import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users,
    Search,
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
} from "lucide-react";
import { BookingModal } from "../components/BookingModal";
import { useHeroSlider } from "../hooks/useHeroSlider";
import { useReservation } from "../hooks/useReservation";
import { useStays } from "../hooks/useStays";
import { destinations, regions, types, fetchStays } from "../data/stays";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { HostApplyBanner } from "../components/HostApplyBanner.tsx";
import { NotificationBell } from '../components/NotificationBell';
import { StayMapModal } from "../components/StayMapModal";
import { TourMapModal } from "../components/TourMapModal";
import { TourSliderSection } from "../components/TourSliderSection"; // 💡 공통 관광지 슬라이더 컴포넌트 재사용
import { StayCard } from "../components/StayCard";
import type { Stay } from "../types/stay.ts";
import { fetchMyWishlist, toggleAccommodationLike } from "../api/stays.ts";
import { fetchTours, type TourSummary } from "../api/tours.ts";
import { WeatherWidget } from "../components/WeatherWidget.tsx";

const heroTitles = [
    "제주에 머무는 시간,\n여행이 되다",
    "바다와 더 가까운\n제주의 하루",
    "오늘의 제주에서\n쉬어 가세요",
];

export function HomePage() {
    const navigate = useNavigate();
    const {
        region,
        setRegion,
        type,
        setType,
        query,
        setQuery,
        result,
        loading,
        apiOnline,
        selectRegion,
        search,
    } = useStays();

    // 오늘 및 내일 기본 날짜 계산
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const tomorrowStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }, []);

    // 검색 패널 상태 (일정, 인원)
    const [checkIn, setCheckIn] = useState(todayStr);
    const [checkOut, setCheckOut] = useState(tomorrowStr);
    const [guests, setGuests] = useState(2);

    // 화면에 보여줄 숙소 개수 (기본 18개)
    const [visibleCount, setVisibleCount] = useState(18);

    // 로그인 상태 관리 및 드롭다운 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userName, setUserName] = useState("내 계정");
    const [userRole, setUserRole] = useState("ROLE_USER");
    const [hasApprovedAccommodation, setHasApprovedAccommodation] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. 숙소 지도 모달 관련 상태 (검색창의 '지도 검색' 버튼용 유지)
    const [modalStays, setModalStays] = useState<Stay[]>([]);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    // 2. 💡 홈페이지 관광지 슬라이더(9개) 및 관광 지도 모달 관련 상태
    const [homeTours, setHomeTours] = useState<TourSummary[]>([]);
    const [modalTours, setModalTours] = useState<TourSummary[]>([]);
    const [isTourMapModalOpen, setIsTourMapModalOpen] = useState(false);

    // 💡 홈페이지 진입 시 관광지 목록 로드 (슬라이더에 9개 표시 & 관광 지도 모달에서 공유)
    useEffect(() => {
        fetchTours()
            .then((data) => {
                // 1. 관광 지도 모달에는 전체 데이터를 그대로 보관
                setModalTours(data);

                // 2. 홈페이지 슬라이더에는 매번 랜덤으로 섞어서 9개만 추출 (대표 이미지가 있는 관광지 우선)
                const withImages = data.filter((t) => t.firstImage);
                const pool = withImages.length >= 9 ? withImages : data;
                const shuffled = [...pool].sort(() => Math.random() - 0.5);
                setHomeTours(shuffled.slice(0, 9));
            })
            .catch((err) => console.error('관광지 목록 로딩 실패:', err));
    }, []);

    // 스크롤 시 검색창 상단 고정(Sticky) 상태 감지
    const [isSearchPinned, setIsSearchPinned] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsSearchPinned(window.scrollY > 430);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 1. [검색 패널용] 숙소 지도 검색 모달 오픈
    const handleMapSearch = async () => {
        const currentScrollY = window.scrollY;

        search(checkIn, checkOut, guests);
        window.scrollTo(0, currentScrollY);

        try {
            const filteredStays = await fetchStays(region, type, query, checkIn, checkOut, guests);
            setModalStays(filteredStays);
        } catch {
            setModalStays(result);
        }

        setIsMapModalOpen(true);
    };

    // 2. 💡 [헤더 '관광 지도' 및 '더 많은 관광지를 둘러보세요' 버튼 공용] 관광 지도 모달 오픈
    const handleOpenTourMap = async () => {
        if (modalTours.length === 0) {
            try {
                const allTours = await fetchTours();
                setHomeTours(allTours);
                setModalTours(allTours);
            } catch (err) {
                console.error('관광지 목록 로딩 실패:', err);
                setModalTours([]);
            }
        }
        setIsTourMapModalOpen(true);
    };

    // 로그인 여부 및 토큰 기반 닉네임 파싱
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
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
                setUserName("Unknown");
            }
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    // 호스트 계정 승인 숙소 보유 여부 체크
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && userRole === 'ROLE_HOST') {
            fetch('/api/v1/accommodations/has-approved', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((res) => (res.ok ? res.json() : false))
                .then((data: boolean) => setHasApprovedAccommodation(data))
                .catch(() => setHasApprovedAccommodation(false));
        }
    }, [userRole]);

    // 드롭다운 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setIsDropdownOpen(false);
        alert('로그아웃되었습니다.');
        navigate('/');
    };

    const handleDummyClick = (menuName: string) => {
        alert(`[${menuName}] 기능은 준비 중입니다.`);
        setIsDropdownOpen(false);
    };

    const [likedContentIds, setLikedContentIds] = useState<Set<string>>(new Set());

    // 로그인 상태일 때 찜 목록 동기화
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && isLoggedIn) {
            fetchMyWishlist()
                .then((data) => {
                    setLikedContentIds(new Set(data.map((item) => item.contentId)));
                })
                .catch((err) => console.error("위시리스트 로딩 실패:", err));
        } else {
            setLikedContentIds(new Set());
        }
    }, [isLoggedIn]);

    // 찜 토글 핸들러 함수
    const handleToggleWishlist = async (e: React.MouseEvent, contentId: string) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            alert("로그인이 필요한 기능입니다.");
            navigate("/login");
            return;
        }

        try {
            const res = await toggleAccommodationLike(contentId);
            setLikedContentIds((prev) => {
                const next = new Set(prev);
                if (res.liked) {
                    next.add(contentId);
                } else {
                    next.delete(contentId);
                }
                return next;
            });
        } catch {
            alert("위시리스트 처리 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        setVisibleCount(18);
    }, [region, type, query]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 18);
    };

    const { slide, previous, next } = useHeroSlider();
    const reservation = useReservation(apiOnline);
    const { open } = reservation;

    return (
        <>
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
                            추천 여행지
                        </a>
                        <button
                            type="button"
                            onClick={handleOpenTourMap}
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
                        <a href="#about" style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
                            서비스 안내
                        </a>

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
                                                                    navigate('/host/accommodation'); // 💡 숙소가 있으면 수정 모드로 열림
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
                                                                navigate('/host/accommodation'); // 💡 숙소가 없으면 등록 모드로 열림 (심사 대기 숙소가 있으면 수정 모드로 열림)
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
                                                    <button type="button" onClick={() => handleDummyClick("사이트 관리")}
                                                            style={dropdownItemStyle}>
                                                        <ShieldAlert size={16} /> 사이트 관리
                                                    </button>
                                                    <button type="button" onClick={() => handleDummyClick("파트너 관리")}
                                                            style={dropdownItemStyle}>
                                                        <Users size={16} /> 파트너 관리
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            navigate('/admin/accommodations'); // 💡 신규 숙소 심사 페이지로 이동
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
                                                onClick={handleLogout}
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

            <main id="top">
                <section className={`hero hero-${slide}`}>
                    <div className="hero-image" />
                    <div className="hero-shade" />
                    <div className="container hero-inner">
                        <div className="hero-copy">
                            <div className="eyebrow light">ONLY JEJU · STAY & TRAVEL</div>
                            <h1>{heroTitles[slide]}</h1>
                            <p>가고 싶은 여행지를 찾고, 마음에 드는 숙소를 만나보세요.</p>
                            <a className="hero-link" href="#stays">
                                숙소 둘러보기 <ArrowRight size={18} />
                            </a>
                        </div>
                        <div className="slide-control">
                            <button aria-label="이전 배너" onClick={previous}>
                                <ChevronLeft size={18} />
                            </button>
                            <span>
                                0{slide + 1} <i /> 03
                            </span>
                            <button aria-label="다음 배너" onClick={next}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 검색 패널: 일정 & 인원 & 검색어 */}
                <section
                    className={`search-wrap container ${isSearchPinned ? 'is-pinned' : ''}`}
                    aria-label="숙소 검색"
                >
                    <form
                        className="search-panel"
                        onSubmit={(e) => {
                            e.preventDefault();
                            search(checkIn, checkOut, guests);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0' }}
                    >
                        {/* 1. 왼쪽 타이틀 영역 */}
                        <div className="search-heading"
                             style={{ minWidth: '165px', maxWidth: '175px', paddingRight: '14px', flexShrink: 0 }}>
                            <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>나에게 맞는 제주를 찾아보세요</span>
                            <strong style={{ fontSize: '17px', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>어디로 떠나실까요?</strong>
                        </div>

                        {/* 2. 일정 선택 필드 */}
                        <div className="search-field" style={{
                            flex: '1.4',
                            minWidth: '260px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
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
                                            setCheckIn(e.target.value);
                                            if (e.target.value >= checkOut) {
                                                const nextD = new Date(e.target.value);
                                                nextD.setDate(nextD.getDate() + 1);
                                                setCheckOut(nextD.toISOString().split('T')[0]);
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
                                        onChange={(e) => setCheckOut(e.target.value)}
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
                                    onChange={(e) => setGuests(Number(e.target.value))}
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
                        <label className="search-field keyword"
                               style={{ flex: '1', minWidth: '150px', padding: '8px 16px' }}>
                            <Search size={20} color="#49717a" style={{ flexShrink: 0 }} />
                            <span style={{ width: '100%' }}>
                                검색어
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="숙소 또는 여행지"
                                    style={{ width: '100%', fontSize: '14px', fontWeight: 600 }}
                                />
                            </span>
                        </label>

                        {/* 5. 검색 버튼 그룹 */}
                        <div style={{ display: 'flex', gap: '8px', paddingLeft: '12px', flexShrink: 0 }}>
                            <button className="search-button" type="submit"
                                    style={{ padding: '16px 20px', fontSize: '14px', gap: '10px' }}>
                                숙소 검색 <ArrowRight size={16} />
                            </button>
                            <button
                                type="button"
                                className="search-button"
                                onClick={handleMapSearch}
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

                {/* 추천 여행지 */}
                <section id="destinations" className="section container">
                    <div className="section-top">
                        <div>
                            <span className="eyebrow">DISCOVER JEJU</span>
                            <h2>제주, 어디에 머물까요?</h2>
                            <p>여행의 분위기를 정하면 숙소 고르기도 쉬워져요.</p>
                        </div>
                    </div>
                    <div className="destination-grid">
                        {destinations.map((d) => (
                            <button
                                key={d.name}
                                className={`destination ${d.className}`}
                                onClick={() => selectRegion(d.name)}
                            >
                                <span className="destination-image" />
                                <span className="destination-content">
                                    <small>JEJU ISLAND</small>
                                    <strong>{d.name}</strong>
                                    <span>
                                        {d.note} <ArrowRight size={17} />
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 💡 관광지 추천 슬라이더 섹션 (TourSliderSection 재사용: 거리 없이 9개 노출 + 하단 관광 지도 연결 버튼) */}
                <section id="travel" className="section container" style={{ paddingTop: 0 }}>
                    <TourSliderSection
                        tours={homeTours}
                        headerRender={
                            <div>
                                <span className="eyebrow">TRAVEL JEJU</span>
                                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                                    제주, 어디를 찾을까요?
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
                                    가고 싶은 관광지를 찾을 수 있어요.
                                </p>
                            </div>
                        }
                        footerRender={
                            <button
                                type="button"
                                onClick={handleOpenTourMap}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '13px 32px',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    borderRadius: '30px',
                                    backgroundColor: '#0f766e',
                                    color: '#ffffff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)',
                                    transition: 'background-color 0.2s ease, transform 0.15s ease',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0d635c';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0f766e';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <MapIcon size={17} />
                                더 많은 관광지를 둘러보세요
                                <ArrowRight size={16} />
                            </button>
                        }
                    />
                </section>

                {/* 숙소 목록 */}
                <section id="stays" className="section stay-section">
                    <div className="container">
                        <div className="section-top">
                            <div>
                                <span className="eyebrow">STAY IN JEJU</span>
                                <h2>제주에서 쉬어 갈 곳</h2>
                                <p>
                                    {loading
                                        ? "숙소 정보를 불러오는 중입니다."
                                        : `${result.length}개의 숙소를 둘러보세요.`}
                                </p>
                            </div>
                            <span className="sample-note">
                                {!apiOnline && "화면 예시 숙소 · 실제 예약 준비 중"}
                            </span>
                        </div>
                        <div className="category-row">
                            <span>지역</span>
                            <div className="chips">
                                {regions.map((r) => (
                                    <button
                                        className={region === r ? "active" : ""}
                                        key={r}
                                        onClick={() => setRegion(r)}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="category-row">
                            <span>숙박 종류</span>
                            <div className="chips">
                                {types.map((t) => (
                                    <button
                                        className={type === t ? "active" : ""}
                                        key={t}
                                        onClick={() => setType(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 공통 StayCard 컴포넌트 사용 */}
                        <div className="stay-grid">
                            {result.slice(0, visibleCount).map((s) => (
                                <StayCard
                                    key={s.contentId}
                                    stay={s}
                                    isLiked={likedContentIds.has(s.contentId)}
                                    onCardClick={(stay) => open(stay)}
                                    onToggleLike={handleToggleWishlist}
                                />
                            ))}
                        </div>

                        {visibleCount < result.length && (
                            <div style={{ textAlign: "center", marginTop: "40px" }}>
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    style={{
                                        padding: "12px 36px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        borderRadius: "30px",
                                        backgroundColor: "#123f4d",
                                        color: "#ffffff",
                                        border: "none",
                                        cursor: "pointer",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        transition: "background-color 0.2s ease",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0e313c")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#123f4d")}
                                >
                                    숙소 더보기 ({visibleCount} / {result.length})
                                </button>
                            </div>
                        )}
                        {!result.length && (
                            <div className="empty">
                                선택한 조건의 숙소가 없습니다. 다른 지역이나 숙박 종류를 골라 주세요.
                            </div>
                        )}
                    </div>
                </section>

                {/* 하단 안내 배너 */}
                <section id="about" className="bottom-banner">
                    <div className="container">
                        <div>
                            <span className="eyebrow light">A LITTLE CLOSER TO JEJU</span>
                            <h2>당신의 속도로, 제주를 만나세요.</h2>
                            <p>머무는 곳에서 시작되는 여행의 좋은 순간들.</p>
                        </div>
                        <a href="#destinations">
                            여행지 둘러보기 <ArrowRight size={18} />
                        </a>
                    </div>
                </section>
            </main>

            <HostApplyBanner />
            <Footer />
            <BookingModal reservation={reservation} />

            {/* 1. 검색창의 '지도 검색' 클릭 시 열리는 숙소 지도 모달 */}
            <StayMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                stays={modalStays}
            />

            {/* 2. 상단 헤더의 '관광 지도' 또는 '더 많은 관광지를 둘러보세요' 클릭 시 열리는 관광지 지도 모달 */}
            <TourMapModal
                isOpen={isTourMapModalOpen}
                onClose={() => setIsTourMapModalOpen(false)}
                tours={modalTours}
            />
        </>
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