import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Phone, Clock, Car, CheckCircle2, ChevronLeft, BedDouble, User, Image as ImageIcon, ImageOff, X } from 'lucide-react';
import { money, getLodgingTypeName } from '../data/stays';
import { Footer } from '../components/Footer';
import {KakaoStayMap} from "../components/KakaoMap.tsx";

interface RoomDto {
    roomId: number;
    roomTitle: string;
    roomSize: string;
    roomBaseCount: string;
    roomMaxCount: string;
    pricePerNight: number;
    imageUrls: string[];
}

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
    rooms: RoomDto[];
}

export function StayDetailPage() {
    const { contentId } = useParams<{ contentId: string }>();
    const navigate = useNavigate();
    const [stay, setStay] = useState<StayDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false); // 전체 사진 모달 제어

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get<StayDetail>(`/api/v1/stays/${contentId}`)
            .then((res) => setStay(res.data))
            .catch((err) => {
                console.error(err);
                alert('숙소 정보를 불러오지 못했습니다.');
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [contentId, navigate]);

    // 모달 활성화 시 배경 스크롤 방지
    useEffect(() => {
        if (isGalleryOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isGalleryOpen]);

    // 숙소 대표 이미지 + 객실들의 모든 사진을 중복 없이 수집
    const allGalleryImages = useMemo(() => {
        if (!stay) return [];
        const set = new Set<string>();

        if (stay.firstImage) set.add(stay.firstImage);

        if (stay.rooms) {
            stay.rooms.forEach((r) => {
                if (r.imageUrls && r.imageUrls.length > 0) {
                    r.imageUrls.forEach((url) => {
                        if (url) set.add(url);
                    });
                }
            });
        }
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

    // 상단 5분할 그리드에 노출할 5개 이미지 추출
    const mainImages = allGalleryImages.slice(0, 5);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* 상단 네비게이션 헤더 */}
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#123f4d' }}>{stay.title}</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '1050px', margin: '24px auto', padding: '0 16px' }}>
                {/* 1. 상단 5분할 갤러리 섹션 (야놀자 스타일) */}
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
                            {/* 좌측 메인 대형 사진 */}
                            <div
                                onClick={() => setIsGalleryOpen(true)}
                                style={{
                                    backgroundImage: `url(${mainImages[0]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.95')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                            />

                            {/* 우측 2x2 서브 사진 영역 */}
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
                                                onClick={() => setIsGalleryOpen(true)}
                                                style={{
                                                    backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
                                                    backgroundColor: '#e2e8f0',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    height: '100%',
                                                    cursor: imgUrl ? 'pointer' : 'default',
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (imgUrl) e.currentTarget.style.opacity = '0.95';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (imgUrl) e.currentTarget.style.opacity = '1';
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
                            등록된 이미지가 없습니다.
                        </div>
                    )}

                    {/* 전체 사진 보기 버튼 (오른쪽 하단 플로팅) */}
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
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <ImageIcon size={16} />
                            전체 사진 ({allGalleryImages.length})
                        </button>
                    )}
                </section>

                {/* 2. 숙소 헤더 정보 */}
                <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '3px 8px', borderRadius: '6px' }}>
                        {getLodgingTypeName(stay.lodgingType)}
                    </span>
                    <h1 style={{ fontSize: '26px', color: '#0f172a', margin: '12px 0 8px 0' }}>{stay.title}</h1>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
                        <MapPin size={17} /> {stay.addr} {stay.zipcode && `(${stay.zipcode})`}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '12px', fontSize: '13px', color: '#334155' }}>
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
                </section>

                {/* 3. 숙소 소개 및 편의시설 */}
                <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '14px' }}>숙소 소개</h2>
                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-line', margin: '0 0 24px 0' }}>
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
                </section>

                {/* 4. 객실 선택 (룸 사진 갤러리 + 상세 정보) */}
                <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>객실 선택</h2>

                    {stay.rooms && stay.rooms.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            {stay.rooms.map((room) => (
                                <RoomCard key={room.roomId} room={room} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: '14px' }}>
                            등록된 개별 객실 정보가 없습니다.
                        </div>
                    )}
                </section>

                {/* 5. 호스트 및 위치 정보 */}
                <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>호스트 정보 및 위치</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0' }}>호스트 파트너: <strong>{stay.hostName}</strong></p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>상세 주소: {stay.addr}</p>
                    {stay.mapX && stay.mapY && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <KakaoStayMap
                                stays={[{ ...stay, basePrice: 0 } as any]}
                                level={4}
                                height="360px"
                            />
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            {/* 6. 전체 사진 보기 모달 (카테고리 탭 제외, 깔끔한 3열 그리드) */}
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
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 모달 헤더 */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '18px 24px',
                                borderBottom: '1px solid #e2e8f0'
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
                                전체 사진 <span style={{ color: '#0f766e', fontSize: '15px' }}>({allGalleryImages.length})</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsGalleryOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#64748b'
                                }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* 모달 이미지 3열 그리드 바디 */}
                        <div
                            style={{
                                padding: '24px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '14px'
                            }}
                        >
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
                                        alt={`gallery-${idx}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
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

// 룸 카드 컴포넌트
function RoomCard({ room }: { room: RoomDto }) {
    const hasImages = room.imageUrls && room.imageUrls.length > 0;
    const [activeImage, setActiveImage] = useState<string>(hasImages ? room.imageUrls[0] : '');

    useEffect(() => {
        if (hasImages) {
            setActiveImage(room.imageUrls[0]);
        } else {
            setActiveImage('');
        }
    }, [room.imageUrls, hasImages]);

    return (
        <div
            style={{
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
        >
            {hasImages ? (
                <>
                    <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#ffffff' }}>
                        <img
                            src={activeImage}
                            alt={room.roomTitle}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                transition: 'all 0.25s ease',
                            }}
                        />
                        {room.imageUrls.length > 1 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <ImageIcon size={12} />
                                {room.imageUrls.indexOf(activeImage) + 1} / {room.imageUrls.length}
                            </div>
                        )}
                    </div>

                    {room.imageUrls.length > 1 && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                padding: '10px 16px',
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #f1f5f9',
                                overflowX: 'auto',
                            }}
                        >
                            {room.imageUrls.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImage(imgUrl)}
                                    style={{
                                        width: '64px',
                                        height: '48px',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        border: activeImage === imgUrl ? '2px solid #0f766e' : '1px solid #cbd5e1',
                                        padding: 0,
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        opacity: activeImage === imgUrl ? 1 : 0.65,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <img
                                        src={imgUrl}
                                        alt={`thumbnail-${idx}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '180px',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#94a3b8',
                    }}
                >
                    <ImageOff size={28} color="#94a3b8" />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                        객실 사진 정보를 제공하지 않는 숙소입니다.
                    </span>
                </div>
            )}

            <div style={{ padding: '20px' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '16px',
                    }}
                >
                    <div>
                        <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 8px 0', fontWeight: 700 }}>
                            {room.roomTitle}
                        </h3>
                        <div style={{ display: 'flex', gap: '14px', color: '#64748b', fontSize: '13px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <BedDouble size={15} color="#0f766e" /> {room.roomSize ? room.roomSize : '기본 객실'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <User size={15} color="#0f766e" /> 기준 {room.roomBaseCount || '2'}인 / 최대 {room.roomMaxCount || '4'}인
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>1박 기준</span>
                            <strong style={{ fontSize: '22px', color: '#0f766e' }}>{money(room.pricePerNight)}</strong>
                        </div>
                        <button
                            type="button"
                            onClick={() => alert(`[${room.roomTitle}] 예약 기능으로 연결됩니다.`)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#123f4d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0e313c')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#123f4d')}
                        >
                            예약하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}