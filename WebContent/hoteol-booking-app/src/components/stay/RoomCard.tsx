import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, User, Image as ImageIcon, ImageOff } from 'lucide-react';
import { money } from '../../data/stays.ts'

export interface RoomDto {
    roomId: number;
    roomTitle: string;
    roomSize: string;
    roomBaseCount: string;
    roomMaxCount: string;
    pricePerNight: number;
    availableCount?: number;
    imageUrls: string[];
}

interface RoomCardProps {
    room: RoomDto;
    stayTitle: string;
    stayAddr: string;
    initialCheckIn?: string;
    initialCheckOut?: string;
    onPreviewImage?: (url: string) => void;
}

export function RoomCard({
                             room,
                             stayTitle,
                             stayAddr,
                             initialCheckIn,
                             initialCheckOut,
                             onPreviewImage
                         }: RoomCardProps) {
    const navigate = useNavigate();
    const hasImages = room.imageUrls && room.imageUrls.length > 0;
    const [activeImage, setActiveImage] = useState<string>(hasImages ? room.imageUrls[0] : '');

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
                    <div
                        onClick={() => activeImage && onPreviewImage?.(activeImage)}
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '280px',
                            backgroundColor: '#ffffff',
                            cursor: 'zoom-in'
                        }}
                    >
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