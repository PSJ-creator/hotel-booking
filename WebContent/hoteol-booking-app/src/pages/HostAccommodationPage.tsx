import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft,
    MapPin,
    Search,
    CheckSquare,
    BedDouble,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';
import { Footer } from '../components/Footer';

declare const window: typeof globalThis & {
    kakao: any;
};

// 편의시설 체크박스용 목록
const FACILITY_OPTIONS = [
    '와이파이', '수영장', '바비큐장', '조식 제공', '피트니스',
    '무료 주차', '편의점', '레스토랑', '스파/사우나', '카페', '반려동물 동반'
];

// 체크인/체크아웃 시간 드롭다운 옵션
const TIME_OPTIONS = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 11; // 11:00 부터 24:00 까지
    return `${hour}:00`;
});

interface MyAccommodation {
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
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectReason?: string;
}

interface RoomItem {
    roomId: number;
    roomTitle: string;
    roomSize: string;
    roomBaseCount: string;
    roomMaxCount: string;
    pricePerNight: number;
    imageUrls: string[];
}

export function HostAccommodationPage() {
    const navigate = useNavigate();

    // 호스트 보유 숙소 목록 및 현재 선택된 숙소 ID (null이면 신규 신청 모드)
    const [myAccommodations, setMyAccommodations] = useState<MyAccommodation[]>([]);
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
    const [rejectReason, setRejectReason] = useState<string | null>(null);

    // 폼 상태 관리 (팀원 원본 유지)
    const [title, setTitle] = useState('');
    const [lodgingType, setLodgingType] = useState('AC01');
    const [tel, setTel] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [addr, setAddr] = useState('');
    const [checkinTime, setCheckinTime] = useState('15:00');
    const [checkoutTime, setCheckoutTime] = useState('11:00');
    const [roomCount, setRoomCount] = useState('');
    const [roomType, setRoomType] = useState('');
    const [parking, setParking] = useState('');
    const [overview, setOverview] = useState('');
    const [firstImage, setFirstImage] = useState('');
    const [firstImage2, setFirstImage2] = useState('');

    // 편의시설 (배열로 관리 후 서버 전송 시 콤마로 결합)
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

    // 경위도는 직접 입력 불가 (읽기 전용)
    const [mapX, setMapX] = useState('');
    const [mapY, setMapY] = useState('');

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // 객실(Room) 관리 상태
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
    const [roomTitle, setRoomTitle] = useState('');
    const [roomSize, setRoomSize] = useState('');
    const [roomBaseCount, setRoomBaseCount] = useState('2');
    const [roomMaxCount, setRoomMaxCount] = useState('4');
    const [pricePerNight, setPricePerNight] = useState<number>(100000);
    const [initialStock, setInitialStock] = useState<number>(5);
    const [roomImageUrlsText, setRoomImageUrlsText] = useState('');
    const [roomSubmitting, setRoomSubmitting] = useState(false);

    const isEditMode = Boolean(selectedContentId);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchMyAccommodationList();
    }, []);

    // 주소 입력시 Api불러와서 좌표변환 (팀원 원본 유지)
    useEffect(() => {
        const loadKakaoApi = async () => {
            if (document.getElementById('kakao-map-sdk')) return;

            try {
                let appKey = import.meta.env.VITE_KAKAO_MAP_KEY || '';
                if (!appKey) {
                    const res = await axios.get('/api/v1/accommodations/map-key');
                    appKey = res.data.mapKey;
                }

                if (appKey) {
                    const script = document.createElement('script');
                    script.id = 'kakao-map-sdk';
                    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=clusterer,services&autoload=false`;
                    script.async = true;
                    document.head.appendChild(script);
                }
            } catch (err) {
                console.error('카카오 키 로드 실패', err);
            }
        };

        loadKakaoApi();
    }, []);

    // 1. 내 숙소 목록 불러오기 (있으면 수정 모드 세팅, 없으면 신규 등록 모드)
    const fetchMyAccommodationList = async (targetId?: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setInitialLoading(false);
            return;
        }

        try {
            setInitialLoading(true);
            const res = await axios.get<MyAccommodation[]>('/api/v1/accommodations/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const list = res.data || [];
            setMyAccommodations(list);

            if (list.length > 0) {
                const target =
                    (targetId && list.find((a) => a.contentId === targetId)) ||
                    list.find((a) => a.approvalStatus === 'APPROVED') ||
                    list[0];
                populateFormWithAccommodation(target);
            } else {
                resetToCreateMode();
            }
        } catch (err) {
            console.error('내 숙소 목록 조회 실패:', err);
        } finally {
            setInitialLoading(false);
        }
    };

    // 선택한 숙소 데이터를 기존 폼에 바인딩
    const populateFormWithAccommodation = (accom: MyAccommodation) => {
        setSelectedContentId(accom.contentId);
        setApprovalStatus(accom.approvalStatus);
        setRejectReason(accom.rejectReason || null);

        setTitle(accom.title || '');
        setLodgingType(accom.lodgingType || 'AC01');
        setTel(accom.tel || '');
        setZipcode(accom.zipcode || '');
        setAddr(accom.addr || '');
        setCheckinTime(accom.checkinTime || '15:00');
        setCheckoutTime(accom.checkoutTime || '11:00');
        setRoomCount(accom.roomCount || '');
        setRoomType(accom.roomType || '');
        setParking(accom.parking || '');
        setOverview(accom.overview || '');
        setFirstImage(accom.firstImage || '');
        setFirstImage2(accom.firstImage2 || '');
        setMapX(accom.mapX || '');
        setMapY(accom.mapY || '');

        const facArray = accom.subFacility
            ? accom.subFacility.split(',').map((s) => s.trim()).filter(Boolean)
            : [];
        setSelectedFacilities(facArray);

        fetchRooms(accom.contentId);
    };

    // 새 숙소 추가 신청 모드로 폼 초기화
    const resetToCreateMode = () => {
        setSelectedContentId(null);
        setApprovalStatus(null);
        setRejectReason(null);
        setTitle('');
        setLodgingType('AC01');
        setTel('');
        setZipcode('');
        setAddr('');
        setCheckinTime('15:00');
        setCheckoutTime('11:00');
        setRoomCount('');
        setRoomType('');
        setParking('');
        setSelectedFacilities([]);
        setOverview('');
        setFirstImage('');
        setFirstImage2('');
        setMapX('');
        setMapY('');
        setRooms([]);
        setIsRoomFormOpen(false);
    };

    // 2. 해당 숙소의 객실(Room) 목록 조회
    const fetchRooms = async (contentId: string) => {
        try {
            const res = await axios.get<RoomItem[]>(`/api/v1/accommodations/${contentId}/rooms`);
            setRooms(res.data || []);
        } catch (err) {
            console.error('객실 목록 조회 실패:', err);
            setRooms([]);
        }
    };

    // 편의시설 체크박스 핸들러
    const handleFacilityToggle = (facility: string) => {
        setSelectedFacilities((prev) =>
            prev.includes(facility)
                ? prev.filter((f) => f !== facility)
                : [...prev, facility]
        );
    };

    // 카카오 API를 이용한 주소 -> 경위도 자동 변환 로직 (팀원 원본 유지)
    const handleSearchGeocode = () => {
        if (!addr.trim()) {
            alert('먼저 주소를 입력해 주세요.');
            return;
        }

        if (!window.kakao || !window.kakao.maps) {
            alert('카카오 지도 서비스가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
            return;
        }

        window.kakao.maps.load(() => {
            if (!window.kakao.maps.services) {
                alert('카카오맵 services를 불러오지 못했습니다.');
                return;
            }

            const geocoder = new window.kakao.maps.services.Geocoder();

            geocoder.addressSearch(addr, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    setMapX(result[0].x); // 경도
                    setMapY(result[0].y); // 위도
                    alert('경위도 좌표가 성공적으로 자동 입력되었습니다.');
                } else {
                    alert('해당 주소의 좌표를 찾을 수 없습니다. 주소를 더 정확히 입력해 주세요. (예: 제주특별자치도 서귀포시 중문관광로 72)');
                }
            });
        });
    };

    // 3. 숙소 신규 등록(POST) 또는 숙소 수정(PUT) 전송
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mapX || !mapY) {
            alert('주소 옆의 [좌표 자동 검색] 버튼을 눌러 경위도 좌표를 채워주세요.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('accessToken');

        const payload = {
            title,
            lodgingType,
            tel,
            zipcode,
            addr,
            checkinTime,
            checkoutTime,
            roomCount,
            roomType: roomType || '',
            parking,
            subFacility: selectedFacilities.join(', '),
            overview,
            firstImage,
            firstImage2,
            mapX,
            mapY
        };

        try {
            if (isEditMode && selectedContentId) {
                // 이미 등록된 숙소면 수정 API 호출
                await axios.put(`/api/v1/accommodations/${selectedContentId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('숙소 정보가 성공적으로 수정되었습니다.');
                await fetchMyAccommodationList(selectedContentId);
            } else {
                // 신규 신청이면 등록 API 호출
                const res = await axios.post('/api/v1/accommodations', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newId = typeof res.data === 'string' ? res.data : undefined;
                alert('숙소 등록 신청이 완료되었습니다. 아래에서 객실(룸)도 미리 등록하실 수 있습니다.');
                await fetchMyAccommodationList(newId);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || '숙소 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 4. 숙소 삭제 핸들러
    const handleDeleteAccommodation = async () => {
        if (!selectedContentId) return;
        if (!window.confirm('정말 이 숙소를 삭제하시겠습니까? 등록된 객실 정보도 함께 삭제됩니다.')) return;

        const token = localStorage.getItem('accessToken');
        try {
            await axios.delete(`/api/v1/accommodations/${selectedContentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('숙소가 정상적으로 삭제되었습니다.');
            await fetchMyAccommodationList();
        } catch (err: any) {
            alert(err.response?.data?.message || '숙소 삭제 중 오류가 발생했습니다.');
        }
    };

    // 5. 객실(Room) 추가/수정 폼 열기
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

    // 6. 객실(Room) 저장 (생성 POST / 수정 PUT)
    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContentId) return;

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
                await axios.post(`/api/v1/accommodations/${selectedContentId}/rooms`, roomPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('새 객실이 추가되었습니다! (오늘부터 90일 치 예약 재고가 자동 생성되었습니다)');
            }
            setIsRoomFormOpen(false);
            fetchRooms(selectedContentId);
        } catch (err: any) {
            alert(err.response?.data?.message || '객실 저장 중 오류가 발생했습니다.');
        } finally {
            setRoomSubmitting(false);
        }
    };

    // 7. 객실(Room) 삭제
    const handleDeleteRoom = async (roomId: number) => {
        if (!selectedContentId) return;
        if (!window.confirm('이 객실을 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('accessToken');
        try {
            await axios.delete(`/api/v1/accommodations/rooms/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('객실이 삭제되었습니다.');
            fetchRooms(selectedContentId);
        } catch (err: any) {
            alert(err.response?.data?.message || '객실 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 예시 글자(Placeholder)를 더 연한 회색으로 만들기 위한 글로벌 스타일 */}
            <style>{`
                .host-input::placeholder { color: #cbd5e1 !important; font-weight: 400; }
                .host-input:focus { border-color: #0f766e !important; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important; outline: none; }
            `}</style>

            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ChevronLeft size={24} color="#123f4d" />
                        </button>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>
                            {isEditMode ? '내 숙소 및 객실 관리' : '신규 숙소 등록 신청'}
                        </span>
                    </div>

                    {/* 보유한 숙소가 있을 때 숙소 전환 또는 신규 신청 전환 셀렉트 박스 */}
                    {myAccommodations.length > 0 && (
                        <select
                            value={selectedContentId || 'NEW'}
                            onChange={(e) => {
                                if (e.target.value === 'NEW') {
                                    resetToCreateMode();
                                } else {
                                    const found = myAccommodations.find((a) => a.contentId === e.target.value);
                                    if (found) populateFormWithAccommodation(found);
                                }
                            }}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#123f4d',
                                cursor: 'pointer'
                            }}
                        >
                            {myAccommodations.map((item) => (
                                <option key={item.contentId} value={item.contentId}>
                                    [{item.approvalStatus === 'APPROVED' ? '승인완료' : item.approvalStatus === 'REJECTED' ? '반려됨' : '심사대기'}] {item.title}
                                </option>
                            ))}
                            <option value="NEW">+ 새 숙소 추가 신청하기</option>
                        </select>
                    )}
                </div>
            </header>

            <main className="container" style={{ maxWidth: '760px', margin: '32px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {initialLoading ? (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>숙소 정보를 불러오는 중입니다...</div>
                ) : (
                    <>
                        {/* 수정 모드일 때 상단 승인 상태 배너 및 숙소 삭제 버튼 */}
                        {isEditMode && approvalStatus && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '16px 20px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px',
                                backgroundColor: approvalStatus === 'APPROVED' ? '#f0fdf4' : approvalStatus === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                                border: `1px solid ${approvalStatus === 'APPROVED' ? '#bbf7d0' : approvalStatus === 'REJECTED' ? '#fecaca' : '#fde68a'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {approvalStatus === 'APPROVED' && <CheckCircle2 size={20} color="#16a34a" />}
                                    {approvalStatus === 'PENDING' && <Clock size={20} color="#d97706" />}
                                    {approvalStatus === 'REJECTED' && <XCircle size={20} color="#dc2626" />}
                                    <div>
                                        <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                                            {approvalStatus === 'APPROVED' && '승인 완료된 숙소입니다 (현재 메인 노출 중)'}
                                            {approvalStatus === 'PENDING' && '관리자 승인 심사 대기 중인 숙소입니다'}
                                            {approvalStatus === 'REJECTED' && `반려된 숙소입니다 (사유: ${rejectReason || '관리자 문의'})`}
                                        </strong>
                                        <span style={{ fontSize: '12px', color: '#475569' }}>
                                            숙소 정보를 수정하거나 페이지 하단에서 객실(Room)을 등록·관리할 수 있습니다.
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDeleteAccommodation}
                                    style={{
                                        padding: '7px 13px',
                                        backgroundColor: '#ffffff',
                                        color: '#dc2626',
                                        border: '1px solid #fecaca',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    숙소 삭제
                                </button>
                            </div>
                        )}

                        {/* 팀원이 만든 숙소 신청/수정 폼 그대로 유지 */}
                        <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>1. 기본 정보</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>여행객에게 보여질 숙소의 기본적인 정보를 입력해주세요.</p>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>숙소 이름 <span style={{color:'#e11d48'}}>*</span></label>
                                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 신라호텔 제주" className="host-input" style={inputStyle} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>숙소 종류 <span style={{color:'#e11d48'}}>*</span></label>
                                            <select value={lodgingType} onChange={(e) => setLodgingType(e.target.value)} className="host-input" style={{...inputStyle, cursor: 'pointer'}}>
                                                <option value="AC01">호텔</option>
                                                <option value="AC02">콘도/리조트</option>
                                                <option value="AC03">펜션/풀빌라</option>
                                                <option value="AC04">모텔</option>
                                                <option value="AC05">캠핑/글램핑</option>
                                                <option value="AC06">게스트하우스</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>숙소 대표 연락처 <span style={{color:'#e11d48'}}>*</span></label>
                                            <input type="text" required value={tel} onChange={(e) => setTel(e.target.value)} placeholder="예: 064-123-4567" className="host-input" style={inputStyle} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>2. 위치 및 좌표 정보</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>상세 주소를 입력한 뒤 <strong>[좌표 자동 검색]</strong> 버튼을 꼭 눌러주세요.</p>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>우편번호</label>
                                            <input type="text" value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="63535" className="host-input" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>상세 주소 <span style={{color:'#e11d48'}}>*</span></label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input type="text" required value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="예: 제주특별자치도 서귀포시 중문관광로 72" className="host-input" style={{...inputStyle, flex: 1}} />
                                                <button type="button" onClick={handleSearchGeocode} style={{ padding: '0 16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#0f766e', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                    <Search size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> 좌표 자동 검색
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                                            <MapPin size={16} color="#0f766e" /> 지도 표출용 경위도 (자동 생성됨)
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <input type="text" value={mapX} readOnly placeholder="경도 (X) - 자동입력" className="host-input" style={{...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed'}} />
                                            <input type="text" value={mapY} readOnly placeholder="위도 (Y) - 자동입력" className="host-input" style={{...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed'}} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>3. 운영 및 시설 정보</h2>

                                <div style={{ display: 'grid', gap: '20px', marginTop: '16px' }}>
                                    {/* 체크인/체크아웃 드롭다운 */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>체크인 시간 <span style={{color:'#e11d48'}}>*</span></label>
                                            <select value={checkinTime} onChange={(e) => setCheckinTime(e.target.value)} className="host-input" style={inputStyle}>
                                                {TIME_OPTIONS.map(time => <option key={`in-${time}`} value={time}>{time}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>체크아웃 시간 <span style={{color:'#e11d48'}}>*</span></label>
                                            <select value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} className="host-input" style={inputStyle}>
                                                {TIME_OPTIONS.map(time => <option key={`out-${time}`} value={time}>{time}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>보유 객실 수</label>
                                            <input type="text" value={roomCount} onChange={(e) => setRoomCount(e.target.value)} placeholder="예: 50실" className="host-input" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>주차 시설</label>
                                            <input type="text" value={parking} onChange={(e) => setParking(e.target.value)} placeholder="예: 무료 주차 가능 (객실당 1대)" className="host-input" style={inputStyle} />
                                        </div>
                                    </div>

                                    {/* 편의시설 체크박스 리스트 */}
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                                            <CheckSquare size={16} color="#0f766e" /> 부대 및 편의시설 (다중 선택)
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                            {FACILITY_OPTIONS.map((fac) => {
                                                const isChecked = selectedFacilities.includes(fac);
                                                return (
                                                    <label key={fac} style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                                                        borderRadius: '20px', border: `1px solid ${isChecked ? '#0f766e' : '#cbd5e1'}`,
                                                        backgroundColor: isChecked ? '#f0fdfa' : '#ffffff', color: isChecked ? '#0f766e' : '#475569',
                                                        fontSize: '13px', fontWeight: isChecked ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s ease'
                                                    }}>
                                                        <input type="checkbox" checked={isChecked} onChange={() => handleFacilityToggle(fac)} style={{ display: 'none' }} />
                                                        {fac}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>숙소 상세 소개글</label>
                                        <textarea rows={4} value={overview} onChange={(e) => setOverview(e.target.value)} placeholder="제주의 푸른 바다가 보이는 아늑한 숙소입니다..." className="host-input" style={{...inputStyle, resize: 'vertical', lineHeight: '1.5'}} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>4. 대표 이미지 URL</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>웹 상에 호스팅된 이미지 링크(URL)를 입력해주세요.</p>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>메인 이미지 URL</label>
                                        <input type="text" value={firstImage} onChange={(e) => setFirstImage(e.target.value)} placeholder="https://example.com/main-image.jpg" className="host-input" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>서브 이미지 URL</label>
                                        <input type="text" value={firstImage2} onChange={(e) => setFirstImage2(e.target.value)} placeholder="https://example.com/sub-image.jpg" className="host-input" style={inputStyle} />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                marginTop: '10px', width: '100%', padding: '16px', backgroundColor: '#123f4d', color: '#ffffff',
                                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}>
                                {loading
                                    ? '저장 중...'
                                    : isEditMode
                                        ? '숙소 정보 수정 저장하기'
                                        : '숙소 등록 심사 신청하기'}
                            </button>
                        </form>

                        {/* 5. 숙소가 등록되어 있을 때만 하단에 노출되는 객실(Room) 생성/수정/삭제 섹션 */}
                        {isEditMode && selectedContentId && (
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

                                {/* 객실 추가/수정 폼 */}
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
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                                객실 크기
                                            </label>
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
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                                    일일 기본 재고 (방 개수)
                                                </label>
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
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                                기준 인원
                                            </label>
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
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                                최대 인원
                                            </label>
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
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                                객실 이미지 URL 목록 (줄바꿈 또는 콤마로 여러 장 등록 가능)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={roomImageUrlsText}
                                                onChange={(e) => setRoomImageUrlsText(e.target.value)}
                                                placeholder="https://example.com/room-1.jpg&#10;https://example.com/room-2.jpg"
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

                                {/* 등록된 객실 목록 표시 */}
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
                                                            backgroundImage: `url(${room.imageUrls?.[0] || firstImage || '/jeju-stays.png'})`,
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
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}

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