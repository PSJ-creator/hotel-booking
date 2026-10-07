import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Map as MapIcon } from "lucide-react";
import { BookingModal } from "../components/stay/BookingModal.tsx";
import { useHeroSlider } from "../hooks/useHeroSlider";
import { useReservation } from "../hooks/useReservation";
import { useStays } from "../hooks/useStays";
import { destinations, regions, types, fetchStays } from "../data/stays";
import { Footer } from "../components/common/Footer.tsx";
import { HostApplyBanner } from "../components/home/HostApplyBanner.tsx";
import { StayMapModal } from "../components/stay/StayMapModal.tsx";
import { TourMapModal } from "../components/tour/TourMapModal.tsx";
import { TourSliderSection } from "../components/tour/TourSliderSection.tsx";
import { StayCard } from "../components/stay/StayCard.tsx";
import { HomeNavbar } from "../components/home/HomeNavbar.tsx";
import { StaySearchBar} from "../components/home/StaySearchBar.tsx";
import type { Stay } from "../types/stay";
import { fetchMyWishlist, toggleAccommodationLike } from "../api/stays";
import { fetchTours, type TourSummary } from "../api/tours";

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

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const tomorrowStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }, []);

    const [checkIn, setCheckIn] = useState(todayStr);
    const [checkOut, setCheckOut] = useState(tomorrowStr);
    const [guests, setGuests] = useState(2);
    const [visibleCount, setVisibleCount] = useState(18);
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('accessToken')));

    // 지도 모달 상태
    const [modalStays, setModalStays] = useState<Stay[]>([]);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    // 관광지 슬라이더(9개) 및 관광 지도 모달 상태 (뒤로가기 시 유지)
    const [homeTours, setHomeTours] = useState<TourSummary[]>([]);
    const [modalTours, setModalTours] = useState<TourSummary[]>([]);
    const [isTourMapModalOpen, setIsTourMapModalOpen] = useState<boolean>(() => {
        return sessionStorage.getItem('home_tour_map_open') === 'true';
    });

    useEffect(() => {
        sessionStorage.setItem('home_tour_map_open', String(isTourMapModalOpen));
    }, [isTourMapModalOpen]);

    useEffect(() => {
        fetchTours()
            .then((data) => {
                setModalTours(data);
                const withImages = data.filter((t) => t.firstImage);
                const pool = withImages.length >= 9 ? withImages : data;
                const shuffled = [...pool].sort(() => Math.random() - 0.5);
                setHomeTours(shuffled.slice(0, 9));
            })
            .catch((err) => console.error('관광지 목록 로딩 실패:', err));
    }, []);

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

    const handleOpenTourMap = async () => {
        if (modalTours.length === 0) {
            try {
                const allTours = await fetchTours();
                setHomeTours(allTours.slice(0, 9));
                setModalTours(allTours);
            } catch {
                setModalTours([]);
            }
        }
        setIsTourMapModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        alert('로그아웃되었습니다.');
        navigate('/');
    };

    const [likedContentIds, setLikedContentIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && isLoggedIn) {
            fetchMyWishlist()
                .then((data) => setLikedContentIds(new Set(data.map((item) => item.contentId))))
                .catch((err) => console.error("위시리스트 로딩 실패:", err));
        } else {
            setLikedContentIds(new Set());
        }
    }, [isLoggedIn]);

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
                if (res.liked) next.add(contentId);
                else next.delete(contentId);
                return next;
            });
        } catch {
            alert("위시리스트 처리 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        setVisibleCount(18);
    }, [region, type, query]);

    const { slide, previous, next } = useHeroSlider();
    const reservation = useReservation(apiOnline);
    const { open } = reservation;

    return (
        <>
            {/* 1. 분리된 상단 네비게이션 바 */}
            <HomeNavbar
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                onOpenTourMap={handleOpenTourMap}
            />

            <main id="top">
                {/* 2. 히어로 배너 슬라이더 */}
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

                {/* 3. 분리된 숙소 검색 패널 */}
                <StaySearchBar
                    todayStr={todayStr}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    query={query}
                    onCheckInChange={setCheckIn}
                    onCheckOutChange={setCheckOut}
                    onGuestsChange={setGuests}
                    onQueryChange={setQuery}
                    onSearchSubmit={() => search(checkIn, checkOut, guests)}
                    onMapSearch={handleMapSearch}
                />

                {/* 4. 추천 여행지 */}
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

                {/* 5. 관광지 추천 슬라이더 */}
                <section
                    id="travel"
                    className="section container"
                    style={{
                        paddingTop: 0,
                        scrollMarginTop: '180px' // 💡 상단 고정 헤더와 검색창 높이만큼 스크롤 오프셋 확보
                    }}
                >
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
                                }}
                            >
                                <MapIcon size={17} />
                                더 많은 관광지를 둘러보세요
                                <ArrowRight size={16} />
                            </button>
                        }
                    />
                </section>

                {/* 6. 숙소 목록 */}
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
                                    onClick={() => setVisibleCount((prev) => prev + 18)}
                                    style={{
                                        padding: "12px 36px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        borderRadius: "30px",
                                        backgroundColor: "#123f4d",
                                        color: "#ffffff",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
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

                {/* 7. 하단 안내 배너 */}
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

            <StayMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                stays={modalStays}
            />

            <TourMapModal
                isOpen={isTourMapModalOpen}
                onClose={() => setIsTourMapModalOpen(false)}
                tours={modalTours}
            />
        </>
    );
}