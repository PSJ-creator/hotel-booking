import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin,
    Phone,
    Clock,
    Car,
    CheckCircle2,
    ChevronDown,
    Heart,
    Calendar,
    Compass,
    Maximize2
} from 'lucide-react';
import { getLodgingTypeName } from '../../data/stays.ts';
import { Footer } from '../../components/common/Footer.tsx';
import { KakaoStayMap } from '../../components/stay/KakaoMap.tsx';
import { TourSliderSection } from '../../components/tour/TourSliderSection.tsx';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { DetailPhotoGallery } from '../../components/common/DetailPhotoGallery.tsx';
import { LocationMapPopupModal} from "../../components/common/LocationMapPopupModal.tsx";
import { RoomCard, type RoomDto} from "../../components/stay/RoomCard.tsx";
import { StayReviewSection} from "../../components/stay/StayReviewSection.tsx";
import { toggleAccommodationLike } from '../../api/stays.ts';
import { fetchNearbyTours, type NearbyTourItem } from '../../api/tours.ts';
import { fetchStayReviews, type ReviewItem } from '../../api/reviews.ts';

interface StayDetail {
    contentId: string;
    title: string;
    lodgingType: string;
    tel: string;
    zipcode: string;
    addr: string;
    checkinTime: string;
    checkoutTime: string;
    roomCount: string;
    roomType: string;
    parking: string;
    subFacility: string;
    overview: string;
    firstImage: string;
    firstImage2: string;
    mapX: string;
    mapY: string;
    hostName: string;
    businessNo?: string;
    rooms: RoomDto[];
}

export function StayDetailPage() {
    const { contentId } = useParams<{ contentId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const tomorrowStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }, []);

    const incomingDates = (location.state as { checkIn?: string; checkOut?: string }) || {};
    const [checkIn, setCheckIn] = useState(incomingDates.checkIn || todayStr);
    const [checkOut, setCheckOut] = useState(incomingDates.checkOut || tomorrowStr);

    const [stay, setStay] = useState<StayDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [roomPreviewImage, setRoomPreviewImage] = useState<string | null>(null);
    const [isSellerInfoOpen, setIsSellerInfoOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);

    const [nearbyTours, setNearbyTours] = useState<NearbyTourItem[]>([]);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [contentId]);
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && contentId) {
            fetch(`/api/v1/likes/accommodations/${contentId}/status`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => (res.ok ? res.json() : false))
                .then((data) => setIsLiked(data))
                .catch(() => setIsLiked(false));
        }
    }, [contentId]);
    useEffect(() => {
        if (!contentId) return;
        axios.get<StayDetail>(`/api/v1/stays/${contentId}`, {
            params: {
                checkIn: checkIn || undefined,
                checkOut: checkOut || undefined,
            }
        })
            .then((res) => setStay(res.data))
            .catch((err) => {
                console.error(err);
                alert('숙소 정보를 불러오지 못했습니다.');
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [contentId, checkIn, checkOut, navigate]);
    useEffect(() => {
        if (!contentId) return;
        fetchNearbyTours(contentId)
            .then((data) => setNearbyTours(data.slice(0, 9)))
            .catch(() => setNearbyTours([]));
    }, [contentId]);
    useEffect(() => {
        if (!contentId) return;
        fetchStayReviews(contentId)
            .then((data) => setReviews(data || []))
            .catch(() => setReviews([]));
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
            const res = await toggleAccommodationLike(contentId);
            setIsLiked(res.liked);
            alert(res.message);
        } catch {
            alert('오류가 발생했습니다.');
        }
    };

    const allGalleryImages = useMemo(() => {
        if (!stay) return [];
        const set = new Set<string>();
        if (stay.firstImage) set.add(stay.firstImage);
        if (stay.firstImage2) set.add(stay.firstImage2);
        stay.rooms?.forEach((r) => {
            r.imageUrls?.forEach((url) => {
                if (url) set.add(url);
            });
        });
        return Array.from(set);
    }, [stay]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '120px 0', color: '#64748b' }}>
                숙소 상세 정보를 불러오는 중입니다...
            </div>
        );
    }

    if (!stay) return null;

    const facilities = stay.subFacility ? stay.subFacility.split(',').map((f) => f.trim()) : [];

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* 1. 공통 상단 헤더 */}
            <PageHeader title={stay.title} titleSize="22px" />

            <main className="container" style={{ maxWidth: '1050px', margin: '24px auto', padding: '0 16px' }}>
                {/* 2. 공통 사진 갤러리 (5분할 배너 + 전체 사진 모달 + 1장 확대 라이트박스) */}
                <DetailPhotoGallery
                    images={allGalleryImages}
                    emptyText="등록된 이미지가 없습니다."
                    modalTitle="전체 사진"
                    externalPreviewImage={roomPreviewImage}
                    onCloseExternalPreview={() => setRoomPreviewImage(null)}
                />

                {/* 3. 숙소 기본 정보 및 리뷰 미리보기 섹션 */}
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
                        aria-label="숙소 찜하기"
                    >
                        <Heart
                            size={40}
                            fill={isLiked ? '#ef4444' : 'none'}
                            color={isLiked ? '#ef4444' : '#94a3b8'}
                            strokeWidth={1.7}
                        />
                    </button>

                    <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0f766e',
                        backgroundColor: '#ccfbf1',
                        padding: '3px 8px',
                        borderRadius: '6px'
                    }}>
                        {getLodgingTypeName(stay.lodgingType)}
                    </span>
                    <h1 style={{ fontSize: '26px', color: '#0f172a', margin: '12px 0 8px 0', paddingRight: '60px' }}>
                        {stay.title}
                    </h1>
                    <p style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#64748b',
                        fontSize: '14px',
                        margin: '0 0 16px 0'
                    }}>
                        <MapPin size={17} /> {stay.addr} {stay.zipcode && `(${stay.zipcode})`}
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: '#334155'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} color="#0f766e" />
                            <span>체크인 {stay.checkinTime || '15:00'} ~ 체크아웃 {stay.checkoutTime || '11:00'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Phone size={16} color="#0f766e" />
                            <span>{stay.tel || '안내 번호 없음'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Car size={16} color="#0f766e" />
                            <span>주차: {stay.parking || '주차 가능 여부 문의'}</span>
                        </div>
                    </div>

                    {/* 분리된 리뷰 미리보기 및 전체 리뷰 모달 컴포넌트 */}
                    <StayReviewSection stayTitle={stay.title} reviews={reviews} />
                </section>

                {/* 4. 숙소 소개 및 찾아오시는 길 */}
                <section style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '28px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '14px' }}>숙소 소개</h2>
                    <p style={{
                        color: '#475569',
                        fontSize: '14px',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-line',
                        margin: '0 0 24px 0'
                    }}>
                        {stay.overview || '등록된 숙소 상세 소개글이 없습니다.'}
                    </p>

                    {facilities.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '12px' }}>편의시설 및 서비스</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {facilities.map((fac, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '6px 12px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            color: '#334155'
                                        }}
                                    >
                                        <CheckCircle2 size={13} color="#0f766e" /> {fac}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px 0' }}>
                        <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>찾아오시는 길</h3>
                        {stay.mapX && stay.mapY && (
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
                        )}
                    </div>

                    {stay.mapX && stay.mapY && (
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
                            <KakaoStayMap
                                stays={[{ ...stay, basePrice: 0 } as any]}
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
                    )}
                </section>

                {/* 5. 객실 선택 섹션 */}
                <section style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '28px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{ fontSize: '18px', color: '#0f172a', margin: 0 }}>객실 선택</h2>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '12px',
                            padding: '8px 14px'
                        }}>
                            <Calendar size={16} color="#0f766e" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>조회 일정:</span>
                            <input
                                type="date"
                                min={todayStr}
                                value={checkIn}
                                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                onChange={(e) => {
                                    const nextIn = e.target.value;
                                    setCheckIn(nextIn);
                                    if (nextIn >= checkOut) {
                                        const nextD = new Date(nextIn);
                                        nextD.setDate(nextD.getDate() + 1);
                                        setCheckOut(nextD.toISOString().split('T')[0]);
                                    }
                                }}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ color: '#94a3b8' }}>~</span>
                            <input
                                type="date"
                                min={checkIn || todayStr}
                                value={checkOut}
                                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                                onChange={(e) => setCheckOut(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {stay.rooms && stay.rooms.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            {stay.rooms.map((room) => (
                                <RoomCard
                                    key={room.roomId}
                                    room={room}
                                    stayTitle={stay.title}
                                    stayAddr={stay.addr}
                                    initialCheckIn={checkIn}
                                    initialCheckOut={checkOut}
                                    onPreviewImage={(url) => setRoomPreviewImage(url)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: '14px' }}>
                            등록된 개별 객실 정보가 없습니다.
                        </div>
                    )}
                </section>

                {/* 6. 주변 20km 관광지 슬라이더 */}
                {nearbyTours.length > 0 && (
                    <section style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '24px',
                        position: 'relative'
                    }}>
                        <TourSliderSection
                            tours={nearbyTours}
                            headerRender={
                                <div>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        color: '#0f766e',
                                        letterSpacing: '0.04em',
                                        marginBottom: '4px'
                                    }}>
                                        <Compass size={14} /> NEARBY ATTRACTIONS (20KM 이내)
                                    </span>
                                    <h2 style={{ fontSize: '19px', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 800 }}>
                                        이 숙소에서 가까운 추천 관광지
                                    </h2>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                        숙소 위치 기준 반경 20km 이내의 가까운 제주 명소 {nearbyTours.length}곳입니다.
                                    </p>
                                </div>
                            }
                        />
                    </section>
                )}

                {/* 7. 판매자 정보 아코디언 */}
                <section style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '20px 28px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                }}>
                    <button
                        type="button"
                        onClick={() => setIsSellerInfoOpen((prev) => !prev)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                        }}
                    >
                        <h2 style={{ fontSize: '16px', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                            판매자 정보
                        </h2>
                        <ChevronDown
                            size={20}
                            color="#64748b"
                            style={{
                                transform: isSellerInfoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    </button>

                    {isSellerInfoOpen && (
                        <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            fontSize: '13px',
                            color: '#64748b'
                        }}>
                            <p style={{ margin: 0 }}>
                                상호명 / 대표자: <strong style={{ color: '#1e293b' }}>{stay.hostName}</strong>
                            </p>
                            <p style={{ margin: 0 }}>
                                사업자등록번호: {stay.businessNo || '등록된 사업자번호 없음'}
                            </p>
                            <p style={{ margin: 0 }}>
                                연락처: {stay.tel || '안내 번호 없음'}
                            </p>
                            <p style={{ margin: 0 }}>
                                사업자주소: {stay.addr}
                            </p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            {/* 8. 공통 지도 크게 보기 팝업 모달 */}
            {stay.mapX && stay.mapY && (
                <LocationMapPopupModal
                    isOpen={isMapPopupOpen}
                    onClose={() => setIsMapPopupOpen(false)}
                    eyebrow="STAY LOCATION MAP"
                    title={stay.title}
                >
                    <KakaoStayMap
                        stays={[{ ...stay, basePrice: 0 } as any]}
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