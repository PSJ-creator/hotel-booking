import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, MapPin, Search, CheckSquare } from 'lucide-react';
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

export function HostAccommodationPage() {
    const navigate = useNavigate();

    // 폼 상태 관리
    const [title, setTitle] = useState('');
    const [lodgingType, setLodgingType] = useState('AC01');
    const [tel, setTel] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [addr, setAddr] = useState('');
    const [checkinTime, setCheckinTime] = useState('15:00');
    const [checkoutTime, setCheckoutTime] = useState('11:00');
    const [roomCount, setRoomCount] = useState('');
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    // 주소 입력시 Api불러와서 좌표변환
    useEffect(() => {
        const loadKakaoApi = async () => {
            // 이미 다른 페이지에서 불러왔다면 패스
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
                    // 💡 services 라이브러리 필수!
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

    // 편의시설 체크박스 핸들러
    const handleFacilityToggle = (facility: string) => {
        setSelectedFacilities((prev) =>
            prev.includes(facility)
                ? prev.filter((f) => f !== facility)
                : [...prev, facility]
        );
    };

    // 💡카카오 API를 이용한 주소 -> 경위도 자동 변환 로직
    const handleSearchGeocode = () => {
        if (!addr.trim()) {
            alert('먼저 주소를 입력해 주세요.');
            return;
        }

        if (!window.kakao || !window.kakao.maps) {
            alert('카카오 지도 서비스가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
            return;
        }

        // 💡 확실하게 로드가 끝난 후(load 콜백 안에서) 변환 기능 실행
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

    // 숙소 등록 전송
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
            roomType: '', // 객실 타입은 나중에 룸 등록에서 상세히
            parking,
            subFacility: selectedFacilities.join(', '), // 배열을 "와이파이, 수영장" 형태로 변환
            overview,
            firstImage,
            firstImage2,
            mapX,
            mapY
        };

        try {
            await axios.post('/api/v1/accommodations', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('숙소 등록 신청이 완료되었습니다. 관리자 승인 후 메인에 노출됩니다.');
            navigate('/');
        } catch (err: any) {
            alert(err.response?.data?.message || '숙소 등록 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 💡 예시 글자(Placeholder)를 더 연한 회색으로 만들기 위한 글로벌 스타일 */}
            <style>{`
                .host-input::placeholder { color: #cbd5e1 !important; font-weight: 400; }
                .host-input:focus { border-color: #0f766e !important; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important; outline: none; }
            `}</style>

            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ChevronLeft size={24} color="#123f4d" />
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#123f4d' }}>신규 숙소 등록 신청</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '760px', margin: '32px auto', padding: '0 20px', flex: 1, width: '100%' }}>
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
                            {/* 💡 체크인/체크아웃 드롭다운 */}
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

                            {/* 💡 편의시설 체크박스 리스트 */}
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
                        {loading ? '신청 정보 전송 중...' : '숙소 등록 심사 신청하기'}
                    </button>
                </form>
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