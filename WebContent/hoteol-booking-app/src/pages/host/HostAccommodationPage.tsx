import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MapPin,
    Search,
    CheckSquare,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';
import { Footer } from '../../components/common/Footer.tsx';
import { PageHeader} from "../../components/common/PageHeader.tsx";
import { HostRoomManager } from '../../components/host/HostRoomManager.tsx';

declare const window: typeof globalThis & {
    kakao: any;
};

const FACILITY_OPTIONS = [
    '와이파이', '수영장', '바비큐장', '조식 제공', '피트니스',
    '무료 주차', '편의점', '레스토랑', '스파/사우나', '카페', '반려동물 동반'
];

const TIME_OPTIONS = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 11;
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

export function HostAccommodationPage() {
    const [myAccommodations, setMyAccommodations] = useState<MyAccommodation[]>([]);
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
    const [rejectReason, setRejectReason] = useState<string | null>(null);

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
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [mapX, setMapX] = useState('');
    const [mapY, setMapY] = useState('');

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const isEditMode = Boolean(selectedContentId);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchMyAccommodationList();
    }, []);
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
    };

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
    };

    const handleFacilityToggle = (facility: string) => {
        setSelectedFacilities((prev) =>
            prev.includes(facility)
                ? prev.filter((f) => f !== facility)
                : [...prev, facility]
        );
    };

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
                    setMapX(result[0].x);
                    setMapY(result[0].y);
                    alert('경위도 좌표가 성공적으로 자동 입력되었습니다.');
                } else {
                    alert('해당 주소의 좌표를 찾을 수 없습니다. 주소를 더 정확히 입력해 주세요. (예: 제주특별자치도 서귀포시 중문관광로 72)');
                }
            });
        });
    };

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
                await axios.put(`/api/v1/accommodations/${selectedContentId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('숙소 정보가 성공적으로 수정되었습니다.');
                await fetchMyAccommodationList(selectedContentId);
            } else {
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

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .host-input::placeholder { color: #cbd5e1 !important; font-weight: 400; }
                .host-input:focus { border-color: #0f766e !important; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important; outline: none; }
            `}</style>

            {/* 1. 공통 상단 헤더 + 우측 숙소 선택 셀렉트 박스 */}
            <PageHeader
                title={isEditMode ? '내 숙소 및 객실 관리' : '신규 숙소 등록 신청'}
                rightElement={
                    myAccommodations.length > 0 ? (
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
                    ) : undefined
                }
            />

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

                        {/* 숙소 기본 정보 등록 / 수정 폼 */}
                        <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>1. 기본 정보</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>여행객에게 보여질 숙소의 기본적인 정보를 입력해주세요.</p>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>숙소 이름 <span style={{ color: '#e11d48' }}>*</span></label>
                                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 신라호텔 제주" className="host-input" style={inputStyle} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={labelStyle}>숙소 종류 <span style={{ color: '#e11d48' }}>*</span></label>
                                            <select value={lodgingType} onChange={(e) => setLodgingType(e.target.value)} className="host-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                                                <option value="AC01">호텔</option>
                                                <option value="AC02">콘도/리조트</option>
                                                <option value="AC03">펜션/풀빌라</option>
                                                <option value="AC04">모텔</option>
                                                <option value="AC05">캠핑/글램핑</option>
                                                <option value="AC06">게스트하우스</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>숙소 대표 연락처 <span style={{ color: '#e11d48' }}>*</span></label>
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
                                            <label style={labelStyle}>우편번호</label>
                                            <input type="text" value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="63535" className="host-input" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>상세 주소 <span style={{ color: '#e11d48' }}>*</span></label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input type="text" required value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="예: 제주특별자치도 서귀포시 중문관광로 72" className="host-input" style={{ ...inputStyle, flex: 1 }} />
                                                <button type="button" onClick={handleSearchGeocode} style={{ padding: '0 16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#0f766e', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                    <Search size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> 좌표 자동 검색
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                                            <MapPin size={16} color="#0f766e" /> 지도 표출용 경위도 (자동 생성됨)
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <input type="text" value={mapX} readOnly placeholder="경도 (X) - 자동입력" className="host-input" style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                                            <input type="text" value={mapY} readOnly placeholder="위도 (Y) - 자동입력" className="host-input" style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>3. 운영 및 시설 정보</h2>

                                <div style={{ display: 'grid', gap: '20px', marginTop: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={labelStyle}>체크인 시간 <span style={{ color: '#e11d48' }}>*</span></label>
                                            <select value={checkinTime} onChange={(e) => setCheckinTime(e.target.value)} className="host-input" style={inputStyle}>
                                                {TIME_OPTIONS.map((time) => <option key={`in-${time}`} value={time}>{time}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>체크아웃 시간 <span style={{ color: '#e11d48' }}>*</span></label>
                                            <select value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} className="host-input" style={inputStyle}>
                                                {TIME_OPTIONS.map((time) => <option key={`out-${time}`} value={time}>{time}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={labelStyle}>보유 객실 수</label>
                                            <input type="text" value={roomCount} onChange={(e) => setRoomCount(e.target.value)} placeholder="예: 50실" className="host-input" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>주차 시설</label>
                                            <input type="text" value={parking} onChange={(e) => setParking(e.target.value)} placeholder="예: 무료 주차 가능 (객실당 1대)" className="host-input" style={inputStyle} />
                                        </div>
                                    </div>

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
                                        <label style={labelStyle}>숙소 상세 소개글</label>
                                        <textarea rows={4} value={overview} onChange={(e) => setOverview(e.target.value)} placeholder="제주의 푸른 바다가 보이는 아늑한 숙소입니다..." className="host-input" style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>4. 대표 이미지 URL</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>웹 상에 호스팅된 이미지 링크(URL)를 입력해주세요.</p>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>메인 이미지 URL</label>
                                        <input type="text" value={firstImage} onChange={(e) => setFirstImage(e.target.value)} placeholder="https://example.com/main-image.jpg" className="host-input" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>서브 이미지 URL</label>
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

                        {/* 2. 분리된 객실(Room) 생성/수정/삭제 섹션 */}
                        {isEditMode && selectedContentId && (
                            <HostRoomManager
                                contentId={selectedContentId}
                                fallbackImage={firstImage}
                            />
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
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