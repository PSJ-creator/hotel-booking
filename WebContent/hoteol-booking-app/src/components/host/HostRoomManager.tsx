import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BedDouble, Plus, Edit3, Trash2 } from 'lucide-react';

export interface RoomItem {
    roomId: number;
    roomTitle: string;
    roomSize: string;
    roomBaseCount: string;
    roomMaxCount: string;
    pricePerNight: number;
    imageUrls: string[];
}

interface HostRoomManagerProps {
    contentId: string;
    fallbackImage?: string;
}

export function HostRoomManager({ contentId, fallbackImage }: HostRoomManagerProps) {
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

    const [roomTitle, setRoomTitle] = useState('');
    const [roomSize, setRoomSize] = useState('26㎡');
    const [roomBaseCount, setRoomBaseCount] = useState('2');
    const [roomMaxCount, setRoomMaxCount] = useState('4');
    const [pricePerNight, setPricePerNight] = useState<number>(120000);
    const [initialStock, setInitialStock] = useState<number>(5);
    const [roomImageUrlsText, setRoomImageUrlsText] = useState('');
    const [roomSubmitting, setRoomSubmitting] = useState(false);

    const fetchRooms = async (targetContentId: string) => {
        try {
            const res = await axios.get<RoomItem[]>(`/api/v1/accommodations/${targetContentId}/rooms`);
            setRooms(res.data || []);
        } catch (err) {
            console.error('객실 목록 조회 실패:', err);
            setRooms([]);
        }
    };

    useEffect(() => {
        if (contentId) {
            setIsRoomFormOpen(false);
            fetchRooms(contentId);
        }
    }, [contentId]);

    const openCreateRoomForm = () => {
        setEditingRoomId(null);
        setRoomTitle('');
        setRoomSize('26㎡');
        setRoomBaseCount('2');
        setRoomMaxCount('4');
        setPricePerNight(120000);
        setInitialStock(5);
        setRoomImageUrlsText('');
        setIsRoomFormOpen(true);
    };

    const openEditRoomForm = (room: RoomItem) => {
        setEditingRoomId(room.roomId);
        setRoomTitle(room.roomTitle || '');
        setRoomSize(room.roomSize || '');
        setRoomBaseCount(room.roomBaseCount || '2');
        setRoomMaxCount(room.roomMaxCount || '4');
        setPricePerNight(room.pricePerNight || 0);
        setInitialStock(5);
        setRoomImageUrlsText((room.imageUrls || []).join('\n'));
        setIsRoomFormOpen(true);
    };

    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contentId) return;

        const token = localStorage.getItem('accessToken');
        const imageUrls = roomImageUrlsText
            .split(/[\n,]/)
            .map((u) => u.trim())
            .filter(Boolean);

        const roomPayload = {
            roomTitle,
            roomSize,
            roomBaseCount,
            roomMaxCount,
            pricePerNight: Number(pricePerNight),
            initialStock: Number(initialStock),
            imageUrls
        };

        setRoomSubmitting(true);
        try {
            if (editingRoomId) {
                await axios.put(`/api/v1/accommodations/rooms/${editingRoomId}`, roomPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('객실 정보가 수정되었습니다.');
            } else {
                await axios.post(`/api/v1/accommodations/${contentId}/rooms`, roomPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('새 객실이 추가되었습니다! (오늘부터 90일 치 예약 재고가 자동 생성되었습니다)');
            }
            setIsRoomFormOpen(false);
            fetchRooms(contentId);
        } catch (err: any) {
            alert(err.response?.data?.message || '객실 저장 중 오류가 발생했습니다.');
        } finally {
            setRoomSubmitting(false);
        }
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (!window.confirm('이 객실을 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('accessToken');
        try {
            await axios.delete(`/api/v1/accommodations/rooms/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('객실이 삭제되었습니다.');
            fetchRooms(contentId);
        } catch (err: any) {
            alert(err.response?.data?.message || '객실 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <section style={{
            marginTop: '28px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BedDouble size={20} color="#0f766e" />
                        5. 객실(Room) 등록 및 관리 ({rooms.length}개)
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        여행객이 예약할 수 있는 객실 타입과 1박 요금, 객실 사진을 관리합니다.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateRoomForm}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Plus size={16} /> 새 객실 추가
                </button>
            </div>

            {isRoomFormOpen && (
                <form
                    onSubmit={handleSaveRoom}
                    style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '14px'
                    }}
                >
                    <div style={{ gridColumn: '1 / -1' }}>
                        <strong style={{ fontSize: '15px', color: '#123f4d' }}>
                            {editingRoomId ? '객실 정보 수정' : '새 객실 추가'}
                        </strong>
                    </div>

                    <div>
                        <label style={labelStyle}>
                            객실 이름 <span style={{ color: '#e11d48' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={roomTitle}
                            onChange={(e) => setRoomTitle(e.target.value)}
                            placeholder="예: 디럭스 오션뷰 더블"
                            className="host-input"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>
                            1박 요금 (원) <span style={{ color: '#e11d48' }}>*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min={0}
                            value={pricePerNight}
                            onChange={(e) => setPricePerNight(Number(e.target.value))}
                            className="host-input"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>객실 크기</label>
                        <input
                            type="text"
                            value={roomSize}
                            onChange={(e) => setRoomSize(e.target.value)}
                            placeholder="예: 28㎡"
                            className="host-input"
                            style={inputStyle}
                        />
                    </div>

                    {!editingRoomId ? (
                        <div>
                            <label style={labelStyle}>일일 기본 재고 (방 개수)</label>
                            <input
                                type="number"
                                min={1}
                                value={initialStock}
                                onChange={(e) => setInitialStock(Number(e.target.value))}
                                className="host-input"
                                style={inputStyle}
                            />
                        </div>
                    ) : <div />}

                    <div>
                        <label style={labelStyle}>기준 인원</label>
                        <input
                            type="number"
                            min={1}
                            value={roomBaseCount}
                            onChange={(e) => setRoomBaseCount(e.target.value)}
                            className="host-input"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>최대 인원</label>
                        <input
                            type="number"
                            min={1}
                            value={roomMaxCount}
                            onChange={(e) => setRoomMaxCount(e.target.value)}
                            className="host-input"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>
                            객실 이미지 URL 목록 (줄바꿈 또는 콤마로 여러 장 등록 가능)
                        </label>
                        <textarea
                            rows={3}
                            value={roomImageUrlsText}
                            onChange={(e) => setRoomImageUrlsText(e.target.value)}
                            placeholder={'https://example.com/room-1.jpg\nhttps://example.com/room-2.jpg'}
                            className="host-input"
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setIsRoomFormOpen(false)}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={roomSubmitting}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#123f4d',
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: roomSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {roomSubmitting ? '저장 중...' : editingRoomId ? '객실 수정 완료' : '객실 등록 완료'}
                        </button>
                    </div>
                </form>
            )}

            {rooms.length === 0 ? (
                <div style={{
                    padding: '36px 20px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '12px'
                }}>
                    아직 등록된 객실이 없습니다. 우측 상단의 <strong>[+ 새 객실 추가]</strong> 버튼을 눌러 객실을 등록해 보세요.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {rooms.map((room) => (
                        <div
                            key={room.roomId}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#fcfdfe',
                                gap: '12px',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div
                                    style={{
                                        width: '88px',
                                        height: '66px',
                                        borderRadius: '8px',
                                        backgroundImage: `url(${room.imageUrls?.[0] || fallbackImage || '/jeju-stays.png'})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundColor: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        flexShrink: 0
                                    }}
                                />
                                <div>
                                    <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                                        {room.roomTitle}
                                    </strong>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                        크기: {room.roomSize || '-'} · 기준 {room.roomBaseCount}인 / 최대 {room.roomMaxCount}인 ·{' '}
                                        <strong style={{ color: '#0f766e' }}>
                                            {Number(room.pricePerNight).toLocaleString()}원 / 1박
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => openEditRoomForm(room)}
                                    style={{
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: '#ffffff',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#334155',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Edit3 size={14} /> 수정
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteRoom(room.roomId)}
                                    style={{
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #fecaca',
                                        backgroundColor: '#fff1f2',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#e11d48',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Trash2 size={14} /> 삭제
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '6px'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#0f172a',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
};