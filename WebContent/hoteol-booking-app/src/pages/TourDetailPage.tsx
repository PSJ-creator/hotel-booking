import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Phone,
    Clock,
    Car,
    ChevronLeft,
    Image as ImageIcon,
    X,
    Heart,
    CalendarOff,
    Ticket,
    CalendarCheck,
    CircleDollarSign,
    Maximize2
} from 'lucide-react';
import { fetchTourDetail, toggleTourLike, type TourDetail } from '../api/tours';
import { Footer } from '../components/Footer';
import { KakaoTourMap } from '../components/KakaoTourMap';

function cleanHtmlText(text?: string): string {
    if (!text) return '';
    return text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<[^>]*>?/gm, '')
        .trim();
}

export function TourDetailPage() {
    const { contentId } = useParams<{ contentId: string }>();
    const navigate = useNavigate();

    const [tour, setTour] = useState<TourDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // 💡 관광지 지도 크게 보기 팝업 모달 상태
    const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [contentId]);

    // 관광지 상세 정보 로드
    useEffect(() => {
        if (!contentId) return;
        setLoading(true);
        fetchTourDetail(contentId)
            .then((data) => setTour(data))
            .catch((err) => {
                console.error(err);
                alert('관광지 정보를 불러오지 못했습니다.');
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [contentId, navigate]);

    // 관광지 찜 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && contentId) {
            fetch(`/api/v1/tours/likes/${contentId}/status`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => (res.ok ? res.json() : false))
                .then((data) => setIsLiked(Boolean(data)))
                .catch(() => setIsLiked(false));
        }
    }, [contentId]);

    // 찜 토글 핸들러
    const handleToggleLike = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 기능입니다.');
            navigate('/login');
            return;
        }
        if (!contentId) return;

        try {
            const res = await toggleTourLike(contentId);
            setIsLiked(res.liked);
            alert(res.message);
        } catch {
            alert('위시리스트 처리 중 오류가 발생했습니다.');
        }
    };

    // 갤러리 또는 지도 팝업 활성화 시 배경 스크롤 잠금
    useEffect(() => {
        document.body.style.overflow = (isGalleryOpen || isMapPopupOpen) ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isGalleryOpen, isMapPopupOpen]);

    const allGalleryImages = useMemo(() => {
        if (!tour) return [];
        const urls: string[] = [];
        const seen = new Set<string>();

        if (tour.firstImage) {
            urls.push(tour.firstImage);
            seen.add(tour.firstImage);
        }

        if (tour.images && tour.images.length > 0) {
            tour.images.forEach((img) => {
                if (img.originImgUrl && !seen.has(img.originImgUrl)) {
                    urls.push(img.originImgUrl);
                    seen.add(img.originImgUrl);
                }
            });
        }
        return urls;
    }, [tour]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '120px 0', color: '#64748b' }}>
                관광지 상세 정보를 불러오는 중입니다...
            </div>
        );
    }

    if (!tour) return null;

    const mainImages = allGalleryImages.slice(0, 5);
    const fullAddress = `${tour.addr1 || ''} ${tour.addr2 || ''}`.trim();

    const infoItems = [
        { icon: <Clock size={16} color="#0f766e" />, label: '이용시간', value: cleanHtmlText(tour.useTime) },
        { icon: <CalendarOff size={16} color="#e11d48" />, label: '쉬는날 (휴무일)', value: cleanHtmlText(tour.restDate) },
        { icon: <Ticket size={16} color="#0f766e" />, label: '입장료 / 이용요금', value: cleanHtmlText(tour.useFee) },
        { icon: <Car size={16} color="#0f766e" />, label: '주차시설', value: cleanHtmlText(tour.parking) },
        { icon: <CircleDollarSign size={16} color="#0f766e" />, label: '주차요금', value: cleanHtmlText(tour.parkingFee) },
        { icon: <Phone size={16} color="#0f766e" />, label: '문의 및 안내', value: cleanHtmlText(tour.tel) },
        { icon: <CalendarCheck size={16} color="#0f766e" />, label: '개장일', value: cleanHtmlText(tour.openDate) },
    ].filter((item) => item.value && item.value.length > 0);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* 상단 네비게이션 헤더 */}
            <header style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#123f4d' }}>{tour.title}</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '1050px', margin: '24px auto', padding: '0 16px' }}>
                {/* 1. 상단 사진 갤러리 섹션 */}
                <section style={{ position: 'relative', marginBottom: '24px' }}>
                    {mainImages.length > 0 ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: mainImages.length > 1 ? '1.2fr 1fr' : '1fr',
                                gap: '8px',
                                height: '420px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                backgroundColor: '#f1f5f9'
                            }}
                        >
                            <div
                                onClick={() => setIsGalleryOpen(true)}
                                style={{
                                    backgroundImage: `url(${mainImages[0]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: '100%',
                                    cursor: 'pointer',
                                }}
                            />

                            {mainImages.length > 1 && (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gridTemplateRows: '1fr 1fr',
                                        gap: '8px',
                                        height: '100%'
                                    }}
                                >
                                    {[1, 2, 3, 4].map((idx) => {
                                        const imgUrl = mainImages[idx];
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => imgUrl && setIsGalleryOpen(true)}
                                                style={{
                                                    backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
                                                    backgroundColor: '#e2e8f0',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    height: '100%',
                                                    cursor: imgUrl ? 'pointer' : 'default',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            style={{
                                height: '320px',
                                borderRadius: '16px',
                                backgroundColor: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8'
                            }}
                        >
                            등록된 관광지 사진이 없습니다.
                        </div>
                    )}

                    {allGalleryImages.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsGalleryOpen(true)}
                            style={{
                                position: 'absolute',
                                right: '16px',
                                bottom: '16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                color: '#0f172a',
                                border: '1px solid #cbd5e1',
                                borderRadius: '24px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            <ImageIcon size={16} />
                            전체 사진 ({allGalleryImages.length})
                        </button>
                    )}
                </section>

                {/* 2. 관광지 기본 헤더 및 이용 안내 정보 */}
                <section style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '28px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px',
                    position: 'relative'
                }}>
                    <button
                        type="button"
                        onClick={handleToggleLike}
                        style={{
                            position: 'absolute',
                            top: '24px',
                            right: '28px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                        aria-label="관광지 찜하기"
                    >
                        <Heart
                            size={38}
                            fill={isLiked ? '#ef4444' : 'none'}
                            color={isLiked ? '#ef4444' : '#94a3b8'}
                            strokeWidth={1.7}
                        />
                    </button>

                    <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#0f766e',
                        backgroundColor: '#ccfbf1',
                        padding: '4px 10px',
                        borderRadius: '6px'
                    }}>
                        제주 관광명소
                    </span>

                    <h1 style={{ fontSize: '26px', color: '#0f172a', margin: '12px 0 8px 0', paddingRight: '60px' }}>
                        {tour.title}
                    </h1>

                    {fullAddress && (
                        <p style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#64748b',
                            fontSize: '14px',
                            margin: '0 0 20px 0'
                        }}>
                            <MapPin size={17} color="#0f766e" />
                            <span>{fullAddress} {tour.zipcode && `(${tour.zipcode})`}</span>
                        </p>
                    )}

                    {infoItems.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '14px',
                            padding: '18px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                        }}>
                            {infoItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <div style={{ marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                                    <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                                            {item.label}
                                        </span>
                                        <span style={{ color: '#1e293b', fontWeight: 600, whiteSpace: 'pre-line' }}>
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 3. 관광지 상세 개요 및 위치 지도 */}
                <section style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '28px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '14px' }}>상세 소개</h2>
                    <p style={{
                        color: '#475569',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-line',
                        margin: '0 0 28px 0'
                    }}>
                        {cleanHtmlText(tour.overview) || '등록된 상세 소개글이 없습니다.'}
                    </p>

                    {tour.mapX && tour.mapY && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px 0' }}>
                                <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0 }}>위치 안내</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsMapPopupOpen(true)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: '#f8fafc',
                                        color: '#123f4d',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Maximize2 size={13} /> 지도 크게 보기
                                </button>
                            </div>

                            {/* 💡 본문 지도: zoomable={false}로 스크롤 시 축소 방지, 클릭 시 팝업 오픈 */}
                            <div
                                onClick={() => setIsMapPopupOpen(true)}
                                style={{
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer'
                                }}
                            >
                                <KakaoTourMap
                                    tours={[tour]}
                                    mode="detail"
                                    level={4}
                                    height="360px"
                                    zoomable={false}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        backgroundColor: 'rgba(15, 23, 42, 0.78)',
                                        backdropFilter: 'blur(4px)',
                                        color: '#ffffff',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        pointerEvents: 'none',
                                        zIndex: 5,
                                    }}
                                >
                                    <Maximize2 size={13} color="#5eead4" />
                                    지도를 클릭하면 팝업창에서 마우스 휠 확대/축소가 가능합니다
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>

            <Footer />

            {/* 💡 지도 크게 보기 팝업 모달 (zoomable={true}로 마우스 휠 확대/축소 허용) */}
            {isMapPopupOpen && tour.mapX && tour.mapY && (
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
                    onClick={() => setIsMapPopupOpen(false)}
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
                                    ATTRACTION LOCATION MAP
                                </span>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                                    {tour.title} 위치 안내
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    마우스 휠 또는 우측 하단 +/- 버튼으로 지도를 자유롭게 확대·축소할 수 있습니다.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMapPopupOpen(false)}
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
                            <KakaoTourMap
                                tours={[tour]}
                                mode="detail"
                                level={4}
                                height="100%"
                                zoomable={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 전체 사진 보기 모달 */}
            {isGalleryOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setIsGalleryOpen(false)}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '960px',
                            maxHeight: '90vh',
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '18px 24px',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
                                관광지 사진 <span style={{ color: '#0f766e', fontSize: '15px' }}>({allGalleryImages.length})</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsGalleryOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '14px'
                        }}>
                            {allGalleryImages.map((url, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        width: '100%',
                                        height: '190px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        backgroundColor: '#f1f5f9',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <img
                                        src={url}
                                        alt={`tour-gallery-${idx}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}