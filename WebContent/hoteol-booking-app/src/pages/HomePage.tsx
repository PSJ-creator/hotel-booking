import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Menu,
    Search,
    User,
    ChevronDown,
    Heart,
    Map,
    CalendarCheck,
    Settings,
    LogOut,
    Home,
    MessageSquare,
    ShieldAlert,
    Users,
    FileCheck,
    PlusCircle,
} from "lucide-react";
import {BookingModal} from "../components/BookingModal";
import {useHeroSlider} from "../hooks/useHeroSlider";
import {useReservation} from "../hooks/useReservation";
import {useStays} from "../hooks/useStays";
import {destinations, money, regions, types, getLodgingTypeName} from "../data/stays";
import {useState, useEffect, useRef} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {Footer} from "../components/Footer";
import {HostApplyBanner} from "../components/HostApplyBanner.tsx";
import {NotificationBell} from '../components/NotificationBell';
import {KakaoStayMap} from "../components/KakaoMap.tsx";

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

    // 화면에 보여줄 숙소 개수 (기본 20개)
    const [visibleCount, setVisibleCount] = useState(18);

    // 로그인 상태 관리 및 드롭다운 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userName, setUserName] = useState("내 계정");
    const [userRole, setUserRole] = useState("ROLE_USER");
    const [hasApprovedAccommodation, setHasApprovedAccommodation] = useState(false); // 💡 추가
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 로그인 여부 및 토큰 기반 닉네임 파싱
// HomePage.tsx의 useEffect 내부
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            try {
                // 한글 깨짐 방지 base64 디코딩
                const base64Payload = token.split('.')[1];
                const decodedPayload = JSON.parse(
                    decodeURIComponent(
                        atob(base64Payload)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    )
                );
                // 이름(Name) 설정
                if (decodedPayload.name) {
                    setUserName(decodedPayload.name);
                } else if (decodedPayload.sub) {
                    setUserName(decodedPayload.sub.split('@')[0]);
                }
                // 권한(ROLE) 설정
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
    // 💡 호스트 계정일 때 승인 숙소 보유 여부 체크
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

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setIsDropdownOpen(false);
        alert('로그아웃되었습니다.');
        navigate('/');
    };

    // 더미 메뉴 클릭 안내
    const handleDummyClick = (menuName: string) => {
        alert(`[${menuName}] 기능은 준비 중입니다.`);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        setVisibleCount(18);
    }, [region, type, query]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 18);
    };

    const {slide, previous, next} = useHeroSlider();
    const reservation = useReservation(apiOnline);
    const {open} = reservation;

    return (
        <>
            <header className="header">
                <div className="nav container">
                    <a className="brand" href="#top" aria-label="제주 야호 홈">
                        <img className="brand-mark" src="/favicon.png" alt="제주 야호 심볼"/>
                        <span>
                            제주 야호<small>JEJU YA-HO</small>
                        </span>
                    </a>
                    <nav className="nav-links">
                        <a href="#destinations">추천 여행지</a>
                        <a href="#map">숙소 찾기</a>
                        <a href="#about">서비스 안내</a>
                    </nav>

                    {/* 우측 영역: 숙소 둘러보기 + 로그인/프로필 영역 */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <a className="nav-cta">
                            제주 숙소 둘러보기 <ArrowRight size={16}/>
                        </a>

                        {/*로그인된 상태: 유저 드롭다운 메뉴 + 알림 종 아이콘 */}
                        {isLoggedIn ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                {/* 1. 프로필 드롭다운 영역 */}
                                <div style={{position: 'relative'}} ref={dropdownRef}>
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
                                            <User size={16}/>
                                        </div>
                                        <span>{userName}</span>

                                        {/* 💡 권한별 뱃지 표시 */}
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
                                        }}/>
                                    </button>

                                    {/* 💡 드롭다운 서브메뉴 */}
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
                                            {/* 1. 일반 사용자 (ROLE_USER) */}
                                            {userRole === 'ROLE_USER' && (
                                                <>
                                                    <button type="button" onClick={() => handleDummyClick("숙소 위시리스트")}
                                                            style={dropdownItemStyle}>
                                                        <Heart size={16}/> 숙소 위시리스트
                                                    </button>
                                                    <button type="button" onClick={() => handleDummyClick("관광지 위시리스트")}
                                                            style={dropdownItemStyle}>
                                                        <Map size={16}/> 관광지 위시리스트
                                                    </button>
                                                    <button type="button" onClick={() => handleDummyClick("예매한 숙소 조회")}
                                                            style={dropdownItemStyle}>
                                                        <CalendarCheck size={16}/> 예매한 숙소 조회
                                                    </button>
                                                    <button type="button" onClick={() => handleDummyClick("회원정보 수정")}
                                                            style={dropdownItemStyle}>
                                                        <Settings size={16}/> 회원정보 수정
                                                    </button>
                                                </>
                                            )}

                                            {/* 2. 숙소 관리자 (ROLE_HOST) */}
                                            {userRole === 'ROLE_HOST' && (
                                                <>
                                                    {hasApprovedAccommodation ? (
                                                        <>
                                                            <button type="button"
                                                                    onClick={() => handleDummyClick("예약 내역 관리")}
                                                                    style={dropdownItemStyle}>
                                                                <CalendarCheck size={16}/> 예약 내역 관리
                                                            </button>
                                                            <button type="button"
                                                                    onClick={() => handleDummyClick("숙소 관리")}
                                                                    style={dropdownItemStyle}>
                                                                <Home size={16}/> 숙소 관리
                                                            </button>
                                                            <button type="button"
                                                                    onClick={() => handleDummyClick("리뷰 관리")}
                                                                    style={dropdownItemStyle}>
                                                                <MessageSquare size={16}/> 리뷰 관리
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button type="button" onClick={() => handleDummyClick("숙소 신청")}
                                                                style={{
                                                                    ...dropdownItemStyle,
                                                                    color: '#0d9488',
                                                                    fontWeight: 600
                                                                }}>
                                                            <PlusCircle size={16}/> 숙소 신청
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* 3. 총괄 관리자 (ROLE_ADMIN) */}
                                            {userRole === 'ROLE_ADMIN' && (
                                                <>
                                                    <button type="button" onClick={() => handleDummyClick("사이트 관리")}
                                                            style={dropdownItemStyle}>
                                                        <ShieldAlert size={16}/> 사이트 관리
                                                    </button>
                                                    <button type="button" onClick={() => handleDummyClick("파트너 관리")}
                                                            style={dropdownItemStyle}>
                                                        <Users size={16}/> 파트너 관리
                                                    </button>
                                                    <button type="button" onClick={() => handleDummyClick("신규 숙소 심사")}
                                                            style={dropdownItemStyle}>
                                                        <FileCheck size={16}/> 신규 숙소 심사
                                                    </button>
                                                </>
                                            )}

                                            {/* 공통: 구분선 및 로그아웃 */}
                                            <div style={{height: '1px', backgroundColor: '#f0f0f0', margin: '6px 0'}}/>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                style={{...dropdownItemStyle, color: '#e53e3e'}}
                                            >
                                                <LogOut size={16}/> 로그아웃
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* 2. 프로필 버튼 우측에 나란히 배치되는 알림 종 컴포넌트 */}
                                <NotificationBell userRole={userRole} isLoggedIn={isLoggedIn}/>
                            </div>
                        ) : (
                            /* 미로그인 상태: 로그인 및 회원가입 버튼 */
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
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
                    <div className="hero-image"/>
                    <div className="hero-shade"/>
                    <div className="container hero-inner">
                        <div className="hero-copy">
                            <div className="eyebrow light">ONLY JEJU · STAY & TRAVEL</div>
                            <h1>{heroTitles[slide]}</h1>
                            <p>가고 싶은 여행지를 찾고, 마음에 드는 숙소를 만나보세요.</p>
                            <a className="hero-link" href="#stays">
                                숙소 둘러보기 <ArrowRight size={18}/>
                            </a>
                        </div>
                        <div className="slide-control">
                            <button aria-label="이전 배너" onClick={previous}>
                                <ChevronLeft size={18}/>
                            </button>
                            <span>
                                0{slide + 1} <i/> 03
                            </span>
                            <button aria-label="다음 배너" onClick={next}>
                                <ChevronRight size={18}/>
                            </button>
                        </div>
                    </div>
                </section>
                <section className="search-wrap container" aria-label="숙소 검색">
                    <form
                        className="search-panel"
                        onSubmit={(e) => {
                            e.preventDefault();
                            search();
                        }}
                    >
                        <div className="search-heading">
                            <span>나에게 맞는 제주를 찾아보세요</span>
                            <strong>어디로 떠나실까요?</strong>
                        </div>
                        <label className="search-field">
                            <MapPin size={21}/>
                            <span>
                                지역
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                >
                                    {regions.map((r) => (
                                        <option key={r}>{r}</option>
                                    ))}
                                </select>
                            </span>
                        </label>
                        <label className="search-field">
                            <Menu size={20}/>
                            <span>
                                숙박 종류
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    {types.map((t) => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </span>
                        </label>
                        <label className="search-field keyword">
                            <Search size={21}/>
                            <span>
                                검색어
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="숙소 또는 여행지"
                                />
                            </span>
                        </label>
                        <button className="search-button" type="submit">
                            숙소 검색 <ArrowRight size={18}/>
                        </button>
                    </form>
                </section>
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
                                <span className="destination-image"/>
                                <span className="destination-content">
                                    <small>JEJU ISLAND</small>
                                    <strong>{d.name}</strong>
                                    <span>
                                        {d.note} <ArrowRight size={17}/>
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
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
                        <div className="stay-grid">
                            {result.slice(0, visibleCount).map((s) => (
                                <article className="stay-card" key={s.contentId}>
                                    <button
                                        className="stay-photo"
                                        onClick={() => open(s)}
                                        aria-label={`${s.title} 자세히 보기`}
                                        style={{
                                            backgroundImage: `url(${s.firstImage || s.firstImage2 || "/jeju-stays.png"})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            backgroundRepeat: "no-repeat",
                                        }}
                                    >
                                        <span className="photo-tag">
                                            {getLodgingTypeName(s.lodgingType)}
                                        </span>
                                    </button>
                                    <div className="stay-info">
                                        <div className="stay-location">
                                            <MapPin size={15}/>
                                            {s.addr?.includes("서귀포") ? "서귀포시" : "제주시"}
                                        </div>
                                        <h3>{s.title}</h3>
                                        <p>
                                            {s.overview
                                                ? `${s.overview.slice(0, 80)}...`
                                                : "편안한 휴식을 제공하는 제주 숙소입니다."}
                                        </p>
                                        <div className="stay-bottom">
                                            <div>
                                                <strong>{money(s.basePrice)}</strong>
                                                <small> / 1박 기준가</small>
                                            </div>
                                            <button
                                                onClick={() => open(s)}
                                                aria-label={`${s.title} 예약 정보 보기`}
                                            >
                                                <ArrowRight size={19}/>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {visibleCount < result.length && (
                            <div style={{textAlign: "center", marginTop: "40px"}}>
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
                <section id="map" className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #eef2f6', borderBottom: '1px solid #eef2f6' }}>
                    <div className="container">
                        <div className="section-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                            <div>
                                <span className="eyebrow">JEJU MAP GUIDE</span>
                                <h2>제주, 어디로 갈까요?</h2>
                                <p>
                                    마커를 클릭하면 숙소 정보와 1박 요금을 확인하고 바로 이동할 수 있습니다.
                                </p>
                            </div>
                            <span className="sample-note" style={{ color: '#0f766e', fontWeight: 600, backgroundColor: '#ccfbf1', padding: '6px 14px', borderRadius: '20px', fontSize: '12px' }}>
                                실시간 등록 숙소 {result.length}곳 탐색 가능
                            </span>
                        </div>

                        {/* 지도 래퍼 카드 (그림자 및 테두리 정돈) */}
                        <div style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #e2e8f0',
                            position: 'relative'
                        }}>
                            <KakaoStayMap stays={result} />
                        </div>
                    </div>
                </section>
                <section id="about" className="bottom-banner">
                    <div className="container">
                        <div>
                            <span className="eyebrow light">A LITTLE CLOSER TO JEJU</span>
                            <h2>당신의 속도로, 제주를 만나세요.</h2>
                            <p>머무는 곳에서 시작되는 여행의 좋은 순간들.</p>
                        </div>
                        <a href="#destinations">
                            여행지 둘러보기 <ArrowRight size={18}/>
                        </a>
                    </div>
                </section>
            </main>

            <HostApplyBanner/>
            <Footer/>
            <BookingModal reservation={reservation}/>
        </>
    );
}

// 드롭다운 아이템 공통 인라인 스타일
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