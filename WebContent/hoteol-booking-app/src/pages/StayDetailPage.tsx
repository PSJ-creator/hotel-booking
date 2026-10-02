import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin,
    Phone,
    Clock,
    Car,
    CheckCircle2,
    ChevronLeft,
    BedDouble,
    User,
    Image as ImageIcon,
    ImageOff,
    X,
    ChevronDown,
    Heart,
    Calendar
} from 'lucide-react';
import { money, getLodgingTypeName } from '../data/stays';
import { Footer } from '../components/Footer';
import { KakaoStayMap } from "../components/KakaoMap.tsx";
import { toggleAccommodationLike } from "../api/stays.ts";

interface RoomDto {
    roomId: number;
    roomTitle: string;
    roomSize: string;
    roomBaseCount: string;
    roomMaxCount: string;
    pricePerNight: number;
    availableCount?: number; // 💡 잔여 객실 수
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

    // 이전 페이지에서 넘어온 날짜가 있으면 사용하고, 없으면 오늘~내일 기본값 세팅
    const incomingDates = (location.state as { checkIn?: string; checkOut?: string }) || {};
    const [checkIn, setCheckIn] = useState(incomingDates.checkIn || todayStr);
    const [checkOut, setCheckOut] = useState(incomingDates.checkOut || tomorrowStr);

    const [stay, setStay] = useState<StayDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isSellerInfoOpen, setIsSellerInfoOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // 찜 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && contentId) {
            fetch(`/api/v1/likes/accommodations/${contentId}/status`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : false)
                .then(data => setIsLiked(data))
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
            const res = await toggleAccommodationLike(contentId);
            setIsLiked(res.liked);
            alert(res.message);
        } catch {
            alert('오류가 발생했습니다.');
        }
    };

    // 최초 진입 시 스크롤 최상단 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [contentId]);

    // 숙소 상세 및 날짜별 잔여 객실 데이터 조회
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

    // 숙소 대표 이미지 + 객실별 사진 수집
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
    const mainImages = allGalleryImages.slice(0, 5);

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
                    <span style={{ fontSize: '22px', fontWeight: 600, color: '#123f4d' }}>{stay.title}</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '1050px', margin: '24px auto', padding: '0 16px' }}>
                {/* 1. 상단 5분할 갤러리 섹션 */}
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
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.95')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
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
                </section>

                {/* 3. 숙소 소개 및 편의시설 */}
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

                    <h3 style={{ fontSize: '15px', color: '#0f172a', margin: '24px 0 12px 0' }}>찾아오시는 길</h3>
                    {stay.mapX && stay.mapY && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <KakaoStayMap
                                stays={[{ ...stay, basePrice: 0 } as any]}
                                mode="detail"
                                level={4}
                                height="360px"
                            />
                        </div>
                    )}
                </section>

                {/* 4. 객실 선택 (상단 날짜 선택 바 포함) */}
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

                        {/* 💡 상세페이지 내 체크인/체크아웃 일정 변경 바 */}
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
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: '14px' }}>
                            등록된 개별 객실 정보가 없습니다.
                        </div>
                    )}
                </section>

                {/* 5. 판매자 정보 */}
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

            {/* 6. 전체 사진 보기 모달 */}
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
function RoomCard({
                      room,
                      stayTitle,
                      stayAddr,
                      initialCheckIn,
                      initialCheckOut
                  }: {
    room: RoomDto;
    stayTitle: string;
    stayAddr: string;
    initialCheckIn?: string;
    initialCheckOut?: string;
}) {
    const navigate = useNavigate();
    const hasImages = room.imageUrls && room.imageUrls.length > 0;
    const [activeImage, setActiveImage] = useState<string>(hasImages ? room.imageUrls[0] : '');

    // 💡 잔여 객실 수 계산 및 마감 여부 판별
    const availableCount = room.availableCount ?? 0;
    const isSoldOut = availableCount <= 0;
    const isUrgent = availableCount > 0 && availableCount <= 3;

    const handleReserveClick = () => {
        if (isSoldOut) return;

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }

        navigate('/reservation', {
            state: {
                roomId: room.roomId,
                roomTitle: room.roomTitle,
                pricePerNight: room.pricePerNight,
                roomImage: hasImages ? room.imageUrls[0] : '',
                stayTitle: stayTitle,
                stayAddr: stayAddr,
                checkIn: initialCheckIn,
                checkOut: initialCheckOut,
            }
        });
    };

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
                opacity: isSoldOut ? 0.75 : 1,
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '18px', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                                {room.roomTitle}
                            </h3>

                            {/* 💡 객실별 잔여 수량 뱃지 */}
                            <span
                                style={{
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    backgroundColor: isSoldOut
                                        ? '#f1f5f9'
                                        : isUrgent
                                            ? '#fef2f2'
                                            : '#f0fdfa',
                                    color: isSoldOut
                                        ? '#94a3b8'
                                        : isUrgent
                                            ? '#dc2626'
                                            : '#0f766e',
                                    border: `1px solid ${
                                        isSoldOut
                                            ? '#e2e8f0'
                                            : isUrgent
                                                ? '#fecaca'
                                                : '#ccfbf1'
                                    }`,
                                }}
                            >
                                {isSoldOut
                                    ? '예약 마감 (0실)'
                                    : isUrgent
                                        ? `마감임박 · 잔여 ${availableCount}실`
                                        : `잔여 ${availableCount}실`}
                            </span>
                        </div>

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
                            <strong style={{ fontSize: '22px', color: isSoldOut ? '#94a3b8' : '#0f766e' }}>
                                {money(room.pricePerNight)}
                            </strong>
                        </div>

                        {/* 💡 잔여 0실일 때 예약하기 버튼 비활성화 */}
                        <button
                            type="button"
                            disabled={isSoldOut}
                            onClick={handleReserveClick}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: isSoldOut ? '#cbd5e1' : '#123f4d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: isSoldOut ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => {
                                if (!isSoldOut) e.currentTarget.style.backgroundColor = '#0e313c';
                            }}
                            onMouseOut={(e) => {
                                if (!isSoldOut) e.currentTarget.style.backgroundColor = '#123f4d';
                            }}
                        >
                            {isSoldOut ? '예약 마감' : '예약하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}