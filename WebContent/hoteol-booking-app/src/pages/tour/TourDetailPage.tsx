import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Phone,
    Clock,
    Car,
    Heart,
    CalendarOff,
    Ticket,
    CalendarCheck,
    CircleDollarSign,
    Maximize2
} from 'lucide-react';
import { fetchTourDetail, toggleTourLike, type TourDetail } from '../../api/tours.ts';
import { Footer } from '../../components/common/Footer.tsx';
import { KakaoTourMap } from '../../components/tour/KakaoTourMap.tsx';
import { PageHeader} from "../../components/common/PageHeader.tsx";
import { DetailPhotoGallery } from '../../components/common/DetailPhotoGallery.tsx';
import { LocationMapPopupModal} from "../../components/common/LocationMapPopupModal.tsx";

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
    const [isLiked, setIsLiked] = useState(false);
    const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [contentId]);

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
            {/* 1. 공통 상단 헤더 */}
            <PageHeader title={tour.title} titleSize="20px" />

            <main className="container" style={{ maxWidth: '1050px', margin: '24px auto', padding: '0 16px' }}>
                {/* 2. 공통 사진 갤러리 (5분할 + 전체사진 모달 + 1장 확대 팝업 자동 포함) */}
                <DetailPhotoGallery
                    images={allGalleryImages}
                    emptyText="등록된 관광지 사진이 없습니다."
                    modalTitle="관광지 사진"
                />

                {/* 3. 관광지 기본 헤더 및 이용 안내 정보 */}
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

                {/* 4. 관광지 상세 개요 및 위치 지도 */}
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

            {/* 5. 공통 지도 크게 보기 팝업 모달 */}
            {tour.mapX && tour.mapY && (
                <LocationMapPopupModal
                    isOpen={isMapPopupOpen}
                    onClose={() => setIsMapPopupOpen(false)}
                    eyebrow="ATTRACTION LOCATION MAP"
                    title={tour.title}
                >
                    <KakaoTourMap
                        tours={[tour]}
                        mode="detail"
                        level={4}
                        height="100%"
                        zoomable={true}
                    />
                </LocationMapPopupModal>
            )}
        </div>
    );
}