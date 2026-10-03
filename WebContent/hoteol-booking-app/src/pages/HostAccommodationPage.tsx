import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft,
    Building2,
    MapPin,
    Phone,
    Clock,
    Car,
    Image as ImageIcon,
    FileText,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Clock3,
    Plus,
    Save,
    Eye,
    BedDouble,
    Trash2,
    Users,
    CircleDollarSign
} from 'lucide-react';
import { money } from '../data/stays';
import { Footer } from '../components/Footer';

export interface HostAccommodationDetail {
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
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    rejectReason?: string;
}

export interface HostRoomItem {
    roomId: number;
    roomTitle: string;
    roomSize: string;
    roomBaseCount: string;
    roomMaxCount: string;
    pricePerNight: number;
    imageUrls: string[];
}

const LODGING_TYPE_OPTIONS = [
    { code: 'AC01', label: '호텔 (AC01)' },
    { code: 'AC02', label: '콘도/리조트 (AC02)' },
    { code: 'AC03', label: '펜션/민박 (AC03)' },
    { code: 'AC04', label: '모텔 (AC04)' },
    { code: 'AC05', label: '캠핑/글램핑 (AC05)' },
    { code: 'AC06', label: '게스트하우스/호스텔 (AC06)' },
];

const emptyForm = {
    title: '',
    lodgingType: 'AC01',
    tel: '',
    zipcode: '',
    addr: '',
    checkinTime: '15:00',
    checkoutTime: '11:00',
    roomCount: '',
    roomType: '',
    parking: '가능 (무료)',
    subFacility: '',
    overview: '',
    firstImage: '',
    firstImage2: '',
    mapX: '126.5292',
    mapY: '33.3617',
};

const emptyNewRoomForm = {
    roomTitle: '',
    roomSize: '26㎡',
    roomBaseCount: '2',
    roomMaxCount: '4',
    pricePerNight: 120000,
    initialStock: 5,
    imageUrlText: '',
};

export function HostAccommodationPage() {
    const navigate = useNavigate();

    const [myList, setMyList] = useState<HostAccommodationDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 분기 모드: 'REGISTER'(숙소가 없거나 새 숙소 추가 시) | 'EDIT'(기존 숙소 수정 시)
    const [mode, setMode] = useState<'REGISTER' | 'EDIT'>('REGISTER');
    const [selectedContentId, setSelectedContentId] = useState<string>('');
    const [form, setForm] = useState(emptyForm);

    // 💡 내 숙소에 속한 객실(ROOM) 목록 상태 및 신규 객실 추가 폼 상태
    const [rooms, setRooms] = useState<HostRoomItem[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [newRoomForm, setNewRoomForm] = useState(emptyNewRoomForm);
    const [roomSavingId, setRoomSavingId] = useState<number | 'NEW' | null>(null);

    // 특정 숙소의 객실(ROOM) 목록 로드
    const loadRooms = async (contentId: string) => {
        if (!contentId) {
            setRooms([]);
            return;
        }
        setRoomsLoading(true);
        try {
            const res = await axios.get<HostRoomItem[]>(`/api/v1/accommodations/${contentId}/rooms`);
            setRooms(res.data || []);
        } catch (err) {
            console.error('객실 목록 조회 실패:', err);
            setRooms([]);
        } finally {
            setRoomsLoading(false);
        }
    };

    // 내 숙소 목록 불러오기 및 자동 분기
    const loadMyAccommodations = async (targetId?: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get<HostAccommodationDetail[]>('/api/v1/accommodations/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data || [];
            setMyList(data);

            if (data.length > 0) {
                const target = (targetId && data.find((d) => d.contentId === targetId)) || data[0];
                setMode('EDIT');
                setSelectedContentId(target.contentId);
                bindFormFromData(target);
                await loadRooms(target.contentId);
            } else {
                setMode('REGISTER');
                setSelectedContentId('');
                setForm(emptyForm);
                setRooms([]);
            }
        } catch (err) {
            console.error('내 숙소 정보 로드 실패:', err);
            alert('숙소 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        loadMyAccommodations();
    }, []);

    const bindFormFromData = (item: HostAccommodationDetail) => {
        setForm({
            title: item.title || '',
            lodgingType: item.lodgingType || 'AC01',
            tel: item.tel || '',
            zipcode: item.zipcode || '',
            addr: item.addr || '',
            checkinTime: item.checkinTime || '15:00',
            checkoutTime: item.checkoutTime || '11:00',
            roomCount: item.roomCount || '',
            roomType: item.roomType || '',
            parking: item.parking || '',
            subFacility: item.subFacility || '',
            overview: item.overview || '',
            firstImage: item.firstImage || '',
            firstImage2: item.firstImage2 || '',
            mapX: item.mapX || '',
            mapY: item.mapY || '',
        });
    };

    const handleSelectAccommodation = (contentId: string) => {
        const found = myList.find((item) => item.contentId === contentId);
        if (found) {
            setMode('EDIT');
            setSelectedContentId(found.contentId);
            bindFormFromData(found);
            setIsAddRoomOpen(false);
            loadRooms(found.contentId);
        }
    };

    const handleSwitchToRegister = () => {
        setMode('REGISTER');
        setSelectedContentId('');
        setForm(emptyForm);
        setRooms([]);
        setIsAddRoomOpen(false);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 숙소 폼 제출 (모드에 따라 POST 등록 또는 PUT 수정)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) {
            alert('숙소명(TITLE)을 입력해 주세요.');
            return;
        }
        if (!form.addr.trim()) {
            alert('기본 주소(ADDR)를 입력해 주세요.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        setSaving(true);

        try {
            if (mode === 'REGISTER') {
                const res = await axios.post<string>('/api/v1/accommodations/register', form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newId = String(res.data);
                alert('신규 숙소 등록 신청이 완료되었습니다! 이제 하단에서 객실(ROOM)을 추가하실 수 있습니다.');
                await loadMyAccommodations(newId);
            } else {
                await axios.put(`/api/v1/accommodations/${selectedContentId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('숙소 기본 정보가 DB에 성공적으로 수정되었습니다.');
                await loadMyAccommodations(selectedContentId);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || err.response?.data || '저장 처리 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };


    // 💡 [객실 추가 핸들러]
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContentId) return;
        if (!newRoomForm.roomTitle.trim()) {
            alert('객실명을 입력해 주세요.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        setRoomSavingId('NEW');

        const imageUrls = newRoomForm.imageUrlText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        try {
            await axios.post(
                `/api/v1/accommodations/${selectedContentId}/rooms`,
                {
                    roomTitle: newRoomForm.roomTitle.trim(),
                    roomSize: newRoomForm.roomSize.trim(),
                    roomBaseCount: String(newRoomForm.roomBaseCount),
                    roomMaxCount: String(newRoomForm.roomMaxCount),
                    pricePerNight: Number(newRoomForm.pricePerNight),
                    initialStock: Number(newRoomForm.initialStock),
                    imageUrls,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`[${newRoomForm.roomTitle}] 객실이 추가되었습니다! (향후 90일 예약 재고 자동 생성 완료)`);
            setNewRoomForm(emptyNewRoomForm);
            setIsAddRoomOpen(false);
            await loadRooms(selectedContentId);
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || '객실 추가 중 오류가 발생했습니다.');
        } finally {
            setRoomSavingId(null);
        }
    };

    // 💡 [기존 객실 수정 핸들러]
    const handleUpdateRoom = async (room: HostRoomItem, imageText: string) => {
        const token = localStorage.getItem('accessToken');
        setRoomSavingId(room.roomId);

        const imageUrls = imageText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        try {
            await axios.put(
                `/api/v1/accommodations/rooms/${room.roomId}`,
                {
                    roomTitle: room.roomTitle,
                    roomSize: room.roomSize,
                    roomBaseCount: room.roomBaseCount,
                    roomMaxCount: room.roomMaxCount,
                    pricePerNight: Number(room.pricePerNight),
                    imageUrls,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`[${room.roomTitle}] 객실 정보 및 가격이 수정되었습니다.`);
            await loadRooms(selectedContentId);
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || '객실 수정 중 오류가 발생했습니다.');
        } finally {
            setRoomSavingId(null);
        }
    };

    // 💡 [객실 삭제 핸들러]
    const handleDeleteRoom = async (room: HostRoomItem) => {
        const ok = window.confirm(
            `[${room.roomTitle}] 객실을 정말 삭제하시겠습니까?\n삭제 시 해당 객실의 재고 및 이미지 정보도 함께 삭제됩니다.`
        );
        if (!ok) return;

        const token = localStorage.getItem('accessToken');
        setRoomSavingId(room.roomId);

        try {
            await axios.delete(`/api/v1/accommodations/rooms/${room.roomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('객실이 삭제되었습니다.');
            await loadRooms(selectedContentId);
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || '해당 객실에 연결된 예약 내역이 있어 삭제할 수 없습니다.');
        } finally {
            setRoomSavingId(null);
        }

    };

    // 💡 [내 숙소 삭제 핸들러] (진행 중 예약이 없을 때만 삭제 허용)
    const handleDeleteAccommodation = async () => {
        if (!selectedContentId || !currentItem) return;

        const confirmDelete = window.confirm(
            `[${currentItem.title}] 숙소를 정말 삭제하시겠습니까?\n\n` +
            `· 진행 중이거나 예정된 예약이 있는 경우 삭제할 수 없습니다.\n` +
            `· 삭제 시 해당 숙소에 등록된 모든 객실(ROOM) 정보도 함께 삭제되며 복구할 수 없습니다.`
        );
        if (!confirmDelete) return;

        const token = localStorage.getItem('accessToken');
        setSaving(true);

        try {
            const res = await axios.delete(`/api/v1/accommodations/${selectedContentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data?.message || '숙소가 정상적으로 삭제되었습니다.');
            await loadMyAccommodations();
        } catch (err: any) {
            alert(
                err.response?.data?.message ||
                err.response?.data ||
                '숙소 삭제 처리 중 오류가 발생했습니다.'
            );
        } finally {
            setSaving(false);
        }
    };



    const currentItem = myList.find((item) => item.contentId === selectedContentId);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 상단 네비게이션 헤더 */}
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <ChevronLeft size={24} color="#123f4d" />
                        </button>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>
                            {mode === 'EDIT' ? '내 숙소 및 객실 관리' : '신규 숙소 등록 신청'}
                        </span>
                    </div>
                    <span style={{
                        fontSize: '12px',
                        backgroundColor: '#e6f4ea',
                        color: '#137333',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 600
                    }}>
                        HOST 파트너 센터
                    </span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '880px', margin: '32px auto', padding: '0 20px', flex: 1, width: '100%' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                        파트너 숙소 정보를 불러오는 중입니다...
                    </div>
                ) : (
                    <>
                        {/* 상단 숙소 전환 탭 */}
                        {myList.length > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {myList.map((item) => {
                                        const isSelected = mode === 'EDIT' && selectedContentId === item.contentId;
                                        return (
                                            <button
                                                key={item.contentId}
                                                type="button"
                                                onClick={() => handleSelectAccommodation(item.contentId)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    border: isSelected ? '1.5px solid #123f4d' : '1px solid #cbd5e1',
                                                    backgroundColor: isSelected ? '#123f4d' : '#ffffff',
                                                    color: isSelected ? '#ffffff' : '#334155',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Building2 size={14} />
                                                <span>{item.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSwitchToRegister}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '20px',
                                        border: mode === 'REGISTER' ? '1.5px solid #0f766e' : '1px dashed #0f766e',
                                        backgroundColor: mode === 'REGISTER' ? '#0f766e' : '#f0fdfa',
                                        color: mode === 'REGISTER' ? '#ffffff' : '#0f766e',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Plus size={14} /> 새 숙소 추가 등록
                                </button>
                            </div>
                        )}

                        {/* 수정 모드일 때 현재 숙소의 승인 상태 안내 배너 */}
                        {mode === 'EDIT' && currentItem && (
                            <div style={{
                                padding: '16px 20px',
                                borderRadius: '14px',
                                marginBottom: '22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px',
                                backgroundColor:
                                    currentItem.approvalStatus === 'APPROVED'
                                        ? '#f0fdfa'
                                        : currentItem.approvalStatus === 'REJECTED'
                                            ? '#fef2f2'
                                            : '#fffbeb',
                                border: `1px solid ${
                                    currentItem.approvalStatus === 'APPROVED'
                                        ? '#99f6e4'
                                        : currentItem.approvalStatus === 'REJECTED'
                                            ? '#fecaca'
                                            : '#fde68a'
                                }`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {currentItem.approvalStatus === 'APPROVED' && <CheckCircle2 size={22} color="#0f766e" />}
                                    {currentItem.approvalStatus === 'PENDING' && <Clock3 size={22} color="#d97706" />}
                                    {currentItem.approvalStatus === 'REJECTED' && <AlertCircle size={22} color="#dc2626" />}

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <strong style={{
                                                fontSize: '14px',
                                                color:
                                                    currentItem.approvalStatus === 'APPROVED'
                                                        ? '#0f766e'
                                                        : currentItem.approvalStatus === 'REJECTED'
                                                            ? '#dc2626'
                                                            : '#b45309'
                                            }}>
                                                {currentItem.approvalStatus === 'APPROVED' && '승인 완료 (현재 홈페이지 노출 중)'}
                                                {currentItem.approvalStatus === 'PENDING' && '승인 심사 대기 중 (관리자 검토 후 노출됩니다)'}
                                                {currentItem.approvalStatus === 'REJECTED' && '승인 반려됨'}
                                            </strong>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                (숙소 ID: {currentItem.contentId})
                                            </span>
                                        </div>

                                        {currentItem.approvalStatus === 'REJECTED' && currentItem.rejectReason && (
                                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#b91c1c', fontWeight: 600 }}>
                                                반려 사유: {currentItem.rejectReason}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {currentItem.approvalStatus === 'APPROVED' && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/stays/${currentItem.contentId}`)}
                                        style={{
                                            padding: '7px 14px',
                                            backgroundColor: '#ffffff',
                                            color: '#0f766e',
                                            border: '1px solid #0f766e',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <Eye size={14} /> 숙소 상세페이지 미리보기
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 1. 숙소 기본 정보 등록 / 수정 폼 카드 */}
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '18px',
                                border: '1px solid #e2e8f0',
                                padding: '32px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                                marginBottom: '28px'
                            }}
                        >
                            <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e', display: 'block', marginBottom: '4px' }}>
                                    {mode === 'EDIT' ? 'STEP 1 · ACCOMMODATION INFO' : 'REGISTER NEW ACCOMMODATION'}
                                </span>
                                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                                    {mode === 'EDIT' ? '숙소 기본 정보 수정' : '새 숙소 등록하기'}
                                </h1>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                    {mode === 'EDIT'
                                        ? 'ACCOMMODATION 테이블에 저장된 숙소 정보를 수정하면 상세페이지에 즉시 반영됩니다.'
                                        : '등록하신 숙소 정보는 심사 후 승인되며 3~4일이 소요될 수 있습니다.'}
                                </p>
                            </div>

                            <h3 style={sectionTitleStyle}>
                                <Building2 size={17} color="#0f766e" /> 기본 숙소 정보
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>숙소명</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="예: 제주 야호 오션뷰 리조트"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>숙박 유형</label>
                                    <select
                                        name="lodgingType"
                                        value={form.lodgingType}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    >
                                        {LODGING_TYPE_OPTIONS.map((opt) => (
                                            <option key={opt.code} value={opt.code}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                                <div>
                                    <label style={labelStyle}>대표 연락처 (TEL)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="tel"
                                            value={form.tel}
                                            onChange={handleChange}
                                            placeholder="064-000-0000"
                                            style={{ ...inputStyle, paddingLeft: '34px' }}
                                        />
                                        <Phone size={15} color="#94a3b8" style={iconInInputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>총 객실 수</label>
                                    <input
                                        type="text"
                                        name="roomCount"
                                        value={form.roomCount}
                                        onChange={handleChange}
                                        placeholder="총 객실 갯수를 적어주세요 예: 25실"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>객실 형태 요약<span style={{ fontWeight: 400, color: '#94a3b8' }}>- 쉼표(,)로 구분해 입력해주세요</span></label>
                                    <input
                                        type="text"
                                        name="roomType"
                                        value={form.roomType}
                                        onChange={handleChange}
                                        placeholder="예: 스탠다드, 디럭스, 스위트"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <h3 style={sectionTitleStyle}>
                                <MapPin size={17} color="#0f766e" /> 위치 및 지도 좌표 정보
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>우편번호 (ZIPCODE)</label>
                                    <input
                                        type="text"
                                        name="zipcode"
                                        value={form.zipcode}
                                        onChange={handleChange}
                                        placeholder="63000"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>상세 주소</label>
                                    <input
                                        type="text"
                                        name="addr"
                                        required
                                        value={form.addr}
                                        onChange={handleChange}
                                        placeholder="예: 제주특별자치도 제주시 애월읍 애월해안로 123"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                                <div>
                                    <label style={labelStyle}>경도 X좌표 (MAP_X)</label>
                                    <input
                                        type="text"
                                        name="mapX"
                                        value={form.mapX}
                                        onChange={handleChange}
                                        placeholder="예: 126.5292"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>위도 Y좌표 (MAP_Y)</label>
                                    <input
                                        type="text"
                                        name="mapY"
                                        value={form.mapY}
                                        onChange={handleChange}
                                        placeholder="예: 33.3617"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <h3 style={sectionTitleStyle}>
                                <Clock size={17} color="#0f766e" /> 체크인·체크아웃 및 편의시설
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>체크인 시간 (CHECKIN_TIME)</label>
                                    <input
                                        type="text"
                                        name="checkinTime"
                                        value={form.checkinTime}
                                        onChange={handleChange}
                                        placeholder="예: 15:00"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>체크아웃 시간 (CHECKOUT_TIME)</label>
                                    <input
                                        type="text"
                                        name="checkoutTime"
                                        value={form.checkoutTime}
                                        onChange={handleChange}
                                        placeholder="예: 11:00"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>주차 안내 (PARKING)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="parking"
                                            value={form.parking}
                                            onChange={handleChange}
                                            placeholder="예: 주차 가능 (무료 30대)"
                                            style={{ ...inputStyle, paddingLeft: '34px' }}
                                        />
                                        <Car size={15} color="#94a3b8" style={iconInInputStyle} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <label style={labelStyle}>
                                    부대시설 및 서비스 <span style={{ fontWeight: 400, color: '#94a3b8' }}>- 쉼표(,)로 구분해 입력하면 상세페이지에 태그로 표시됩니다</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="subFacility"
                                        value={form.subFacility}
                                        onChange={handleChange}
                                        placeholder="예: 야외수영장, 바비큐장, 오션뷰 루프탑, 무료 와이파이, 조식 운영"
                                        style={{ ...inputStyle, paddingLeft: '34px' }}
                                    />
                                    <Sparkles size={15} color="#94a3b8" style={iconInInputStyle} />
                                </div>
                            </div>

                            <h3 style={sectionTitleStyle}>
                                <ImageIcon size={17} color="#0f766e" /> 숙소 대표 이미지
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>대표 이미지 1 URL</label>
                                    <input
                                        type="text"
                                        name="firstImage"
                                        value={form.firstImage}
                                        onChange={handleChange}
                                        placeholder="https://example.com/stay-main.jpg"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>보조 이미지 2 URL</label>
                                    <input
                                        type="text"
                                        name="firstImage2"
                                        value={form.firstImage2}
                                        onChange={handleChange}
                                        placeholder="https://example.com/stay-sub.jpg"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {(form.firstImage || form.firstImage2) && (
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                                    {form.firstImage && (
                                        <div style={{ width: '160px', height: '105px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                                            <img src={form.firstImage} alt="대표 이미지 1 미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    {form.firstImage2 && (
                                        <div style={{ width: '160px', height: '105px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                                            <img src={form.firstImage2} alt="보조 이미지 2 미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <h3 style={sectionTitleStyle}>
                                <FileText size={17} color="#0f766e" /> 숙소 상세 소개
                            </h3>
                            <div style={{ marginBottom: '24px' }}>
                                <textarea
                                    name="overview"
                                    rows={5}
                                    value={form.overview}
                                    onChange={handleChange}
                                    placeholder="숙소의 매력 포인트, 주변 경관, 이용 안내 등을 자유롭게 작성해 주세요."
                                    style={{
                                        ...inputStyle,
                                        height: 'auto',
                                        lineHeight: 1.6,
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* 하단 삭제 및 저장/등록 버튼 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    {mode === 'EDIT' && selectedContentId && (
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={handleDeleteAccommodation}
                                            style={{
                                                padding: '13px 20px',
                                                borderRadius: '10px',
                                                border: '1px solid #fecdd3',
                                                backgroundColor: '#fff1f2',
                                                color: '#e11d48',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                            이 숙소 삭제
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        style={{
                                            padding: '13px 24px',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: '#ffffff',
                                            color: '#475569',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        홈으로
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        style={{
                                            padding: '13px 28px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: '#123f4d',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(18, 63, 77, 0.2)'
                                        }}
                                    >
                                        <Save size={16} />
                                        {saving
                                            ? '처리 중...'
                                            : mode === 'EDIT'
                                                ? '숙소 기본 정보 저장'
                                                : '신규 숙소 등록 신청'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* 💡 2. [객실(ROOM) 관리 섹션] 숙소가 등록된 상태(EDIT 모드)일 때 노출 */}
                        {mode === 'EDIT' && selectedContentId && (
                            <section
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '18px',
                                    border: '1px solid #e2e8f0',
                                    padding: '32px',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    marginBottom: '24px',
                                    paddingBottom: '16px',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f766e', display: 'block', marginBottom: '4px' }}>
                                            STEP 2 · ROOM & PRICE MANAGEMENT
                                        </span>
                                        <h2 style={{ fontSize: '21px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                                            보유 객실 및 1박 요금 관리 <span style={{ color: '#0f766e' }}>({rooms.length}개)</span>
                                        </h2>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                            이 숙소에 속한 객실(ROOM)을 추가하거나 객실별 1박 요금 및 정원을 수정할 수 있습니다.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsAddRoomOpen((prev) => !prev)}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: '#0f766e',
                                            color: '#ffffff',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                                        }}
                                    >
                                        <Plus size={16} />
                                        {isAddRoomOpen ? '객실 추가 창 닫기' : '새 객실 추가하기'}
                                    </button>
                                </div>

                                {/* 새 객실 추가 폼 */}
                                {isAddRoomOpen && (
                                    <form
                                        onSubmit={handleCreateRoom}
                                        style={{
                                            backgroundColor: '#f0fdfa',
                                            border: '1.5px solid #99f6e4',
                                            borderRadius: '14px',
                                            padding: '22px',
                                            marginBottom: '24px'
                                        }}
                                    >
                                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f766e', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <BedDouble size={17} /> 신규 객실 등록 (ROOM + 90일 예약 재고 자동 생성)
                                        </h3>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                            <div>
                                                <label style={labelStyle}>객실명 (ROOM_TITLE) *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newRoomForm.roomTitle}
                                                    onChange={(e) => setNewRoomForm((p) => ({ ...p, roomTitle: e.target.value }))}
                                                    placeholder="예: 디럭스 오션뷰 더블"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>객실 크기 (ROOM_SIZE)</label>
                                                <input
                                                    type="text"
                                                    value={newRoomForm.roomSize}
                                                    onChange={(e) => setNewRoomForm((p) => ({ ...p, roomSize: e.target.value }))}
                                                    placeholder="예: 32㎡ (약 10평)"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>1박 요금 (PRICE_PER_NIGHT) *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min={0}
                                                    step={1000}
                                                    value={newRoomForm.pricePerNight}
                                                    onChange={(e) => setNewRoomForm((p) => ({ ...p, pricePerNight: Number(e.target.value) }))}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                            <div>
                                                <label style={labelStyle}>기준 인원 (ROOM_BASE_COUNT)</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={newRoomForm.roomBaseCount}
                                                    onChange={(e) => setNewRoomForm((p) => ({ ...p, roomBaseCount: e.target.value }))}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>최대 인원 (ROOM_MAX_COUNT)</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={newRoomForm.roomMaxCount}
                                                    onChange={(e) => setNewRoomForm((p) => ({ ...p, roomMaxCount: e.target.value }))}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>일일 판매 객실 수 (초기 재고)</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={100}
                                                    value={newRoomForm.initialStock}
                                                    onChange={(e) => setNewRoomForm((p) => ({ ...p, initialStock: Number(e.target.value) }))}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={labelStyle}>
                                                객실 사진 URL (쉼표 `,`로 여러 장 등록 가능)
                                            </label>
                                            <input
                                                type="text"
                                                value={newRoomForm.imageUrlText}
                                                onChange={(e) => setNewRoomForm((p) => ({ ...p, imageUrlText: e.target.value }))}
                                                placeholder="https://example.com/room1.jpg, https://example.com/room2.jpg"
                                                style={inputStyle}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddRoomOpen(false)}
                                                style={{
                                                    padding: '9px 16px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1',
                                                    backgroundColor: '#ffffff',
                                                    color: '#475569',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                취소
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={roomSavingId === 'NEW'}
                                                style={{
                                                    padding: '9px 20px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#0f766e',
                                                    color: '#ffffff',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    cursor: roomSavingId === 'NEW' ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {roomSavingId === 'NEW' ? '등록 중...' : '새 객실 저장'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* 등록된 객실 목록 렌더링 */}
                                {roomsLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>
                                        객실 목록을 불러오는 중입니다...
                                    </div>
                                ) : rooms.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '48px 20px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '14px',
                                        border: '1px dashed #cbd5e1',
                                        color: '#64748b'
                                    }}>
                                        <BedDouble size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                                        <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#334155', fontSize: '15px' }}>
                                            아직 등록된 객실(ROOM)이 없습니다.
                                        </p>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                            우측 상단의 [+ 새 객실 추가하기] 버튼을 눌러 첫 객실과 1박 요금을 등록해 보세요!
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {rooms.map((room) => (
                                            <RoomEditRow
                                                key={room.roomId}
                                                room={room}
                                                saving={roomSavingId === room.roomId}
                                                onSave={handleUpdateRoom}
                                                onDelete={handleDeleteRoom}
                                            />
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

// 💡 개별 객실 수정 카드 컴포넌트
function RoomEditRow({
                         room,
                         saving,
                         onSave,
                         onDelete
                     }: {
    room: HostRoomItem;
    saving: boolean;
    onSave: (updated: HostRoomItem, imageText: string) => void;
    onDelete: (room: HostRoomItem) => void;
}) {
    const [editRoom, setEditRoom] = useState<HostRoomItem>(room);
    const [imageText, setImageText] = useState<string>((room.imageUrls || []).join(', '));

    useEffect(() => {
        setEditRoom(room);
        setImageText((room.imageUrls || []).join(', '));
    }, [room]);

    const thumbUrl = imageText.split(',')[0]?.trim();

    return (
        <div
            style={{
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '20px',
                backgroundColor: '#fcfdfe',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        backgroundColor: '#e2e8f0',
                        color: '#334155',
                        fontSize: '11px',
                        fontWeight: 700
                    }}>
                        ROOM #{room.roomId}
                    </span>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>{editRoom.roomTitle}</strong>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f766e' }}>
                        ({money(editRoom.pricePerNight)} / 1박)
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => onDelete(room)}
                        style={{
                            padding: '7px 12px',
                            borderRadius: '8px',
                            border: '1px solid #fecdd3',
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Trash2 size={14} /> 삭제
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => onSave(editRoom, imageText)}
                        style={{
                            padding: '7px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#123f4d',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <Save size={14} /> {saving ? '저장 중...' : '객실 수정 저장'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: thumbUrl ? '130px 1fr' : '1fr', gap: '16px', alignItems: 'center' }}>
                {thumbUrl && (
                    <div style={{
                        width: '130px',
                        height: '95px',
                        borderRadius: '10px',
                        backgroundImage: `url(${thumbUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f1f5f9'
                    }} />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 1.2fr', gap: '10px' }}>
                        <div>
                            <label style={labelStyle}>객실명</label>
                            <input
                                type="text"
                                value={editRoom.roomTitle}
                                onChange={(e) => setEditRoom((p) => ({ ...p, roomTitle: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>크기</label>
                            <input
                                type="text"
                                value={editRoom.roomSize || ''}
                                onChange={(e) => setEditRoom((p) => ({ ...p, roomSize: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>
                                <Users size={11} style={{ marginRight: '3px' }} />기준 인원
                            </label>
                            <input
                                type="text"
                                value={editRoom.roomBaseCount || ''}
                                onChange={(e) => setEditRoom((p) => ({ ...p, roomBaseCount: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>최대 인원</label>
                            <input
                                type="text"
                                value={editRoom.roomMaxCount || ''}
                                onChange={(e) => setEditRoom((p) => ({ ...p, roomMaxCount: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, color: '#0f766e' }}>
                                <CircleDollarSign size={11} style={{ marginRight: '3px' }} />1박 가격 (원)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step={1000}
                                value={editRoom.pricePerNight || 0}
                                onChange={(e) => setEditRoom((p) => ({ ...p, pricePerNight: Number(e.target.value) }))}
                                style={{ ...inputStyle, fontWeight: 700, color: '#0f766e', borderColor: '#0f766e' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>객실 이미지 URL 목록 (쉼표 `,`로 구분)</label>
                        <input
                            type="text"
                            value={imageText}
                            onChange={(e) => setImageText(e.target.value)}
                            placeholder="https://example.com/room-img1.jpg, https://example.com/room-img2.jpg"
                            style={inputStyle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 14px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '7px'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '6px'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff'
};

const iconInInputStyle: React.CSSProperties = {
    position: 'absolute',
    left: '11px',
    top: '11px'
};