import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Stay } from '../types/stay';
import { money, getLodgingTypeName } from '../data/stays';

declare const window: typeof globalThis & {
    kakao: any;
};

interface KakaoStayMapProps {
    stays: Stay[];
    level?: number;
    height?: string;
    mode?: 'search' | 'detail'; // 💡 모드 구분 (기본값: 'search')
}

export function KakaoStayMap({ stays, level, height = '520px', mode = 'search' }: KakaoStayMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. 카카오 지도 SDK 동적 주입
    useEffect(() => {
        let isMounted = true;

        const initKakaoMap = async () => {
            const existingScript = document.getElementById('kakao-map-sdk');
            if (existingScript) {
                if (window.kakao && window.kakao.maps) {
                    if (isMounted) setIsLoaded(true);
                } else {
                    existingScript.addEventListener('load', () => {
                        if (isMounted) setIsLoaded(true);
                    });
                }
                return;
            }

            // 백엔드(application-secret.properties)에서 카카오 맵 키 조회
            let appKey = import.meta.env.VITE_KAKAO_MAP_KEY || '';
            if (!appKey) {
                try {
                    const res = await fetch('/api/v1/accommodations/map-key');
                    if (res.ok) {
                        const data = await res.json();
                        appKey = data.mapKey;
                    }
                } catch (e) {
                    console.error('카카오 지도 키를 가져오지 못했습니다.', e);
                }
            }

            if (!appKey || !isMounted) return;

            const script = document.createElement('script');
            script.id = 'kakao-map-sdk';
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=clusterer&autoload=false`;
            script.async = true;

            script.onload = () => {
                if (isMounted) setIsLoaded(true);
            };

            document.head.appendChild(script);
        };

        initKakaoMap();

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. 지도 초기화 및 마커 렌더링
    useEffect(() => {
        if (!isLoaded || !window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;

            const validStays = stays.filter(
                (s) => s.mapX && s.mapY && !isNaN(Number(s.mapX)) && !isNaN(Number(s.mapY))
            );

            // 💡 상세페이지 모드인지 여부 (mode가 'detail'일 때만 작동)
            const isDetailPage = mode === 'detail';
            const isSingleStay = validStays.length === 1;

            // 중심 좌표: 상세페이지이거나 검색 결과가 딱 1곳이면 해당 숙소 좌표, 그 외는 제주도 전역
            const centerPosition = (isDetailPage || isSingleStay) && validStays.length > 0
                ? new window.kakao.maps.LatLng(
                    parseFloat(validStays[0].mapY!),
                    parseFloat(validStays[0].mapX!)
                )
                : new window.kakao.maps.LatLng(33.3617, 126.5292);

            // 줌 레벨: level prop 우선 -> 상세페이지면 4(근접), 검색 모달이면 숙소 1개여도 적당히 주변이 보이는 6~7 또는 지정된 레벨
            const zoomLevel = level ?? (isDetailPage ? 4 : isSingleStay ? 6 : 9);

            const options = {
                center: centerPosition,
                level: zoomLevel,
            };
            const map = new window.kakao.maps.Map(mapContainerRef.current, options);

            // =========================================================
            // 💡 [케이스 A] 객실 상세페이지 전용 뷰 (mode === 'detail')
            // : 숙박종류 + 숙소명 + 상세 주소 + 주소 복사 버튼 (가격/상세보기 제외)
            // =========================================================
            if (isDetailPage && validStays.length > 0) {
                const stay = validStays[0];
                const marker = new window.kakao.maps.Marker({
                    position: centerPosition,
                    map: map,
                });

                const detailCard = document.createElement('div');
                detailCard.style.cssText = `
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.16);
                    border: 1px solid #cbd5e1;
                    padding: 12px 14px;
                    min-width: 220px;
                    max-width: 280px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    position: relative;
                `;

                // 💡 상단 X(닫기) 버튼 및 주소 복사 버튼 추가
                detailCard.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                        <span style="font-size: 11px; color: #0f766e; font-weight: 700;">
                            ${getLodgingTypeName(stay.lodgingType)}
                        </span>
                        <button id="btn-close-detail-overlay" style="
                            background: none;
                            border: none;
                            font-size: 14px;
                            color: #94a3b8;
                            cursor: pointer;
                            padding: 0 0 0 8px;
                            line-height: 1;
                        ">✕</button>
                    </div>
                    <strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">
                        ${stay.title}
                    </strong>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.4; margin-bottom: 8px; word-break: keep-all;">
                        ${stay.addr || '등록된 주소 정보 없음'}
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button id="btn-copy-stay-addr" style="
                            flex: 1;
                            padding: 6px 0;
                            background-color: #f1f5f9;
                            color: #123f4d;
                            border: 1px solid #cbd5e1;
                            border-radius: 6px;
                            font-size: 11px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            주소 복사
                        </button>
                        <button id="btn-close-bottom" style="
                            padding: 6px 12px;
                            background-color: #ffffff;
                            color: #64748b;
                            border: 1px solid #cbd5e1;
                            border-radius: 6px;
                            font-size: 11px;
                            cursor: pointer;
                        ">
                            닫기
                        </button>
                    </div>
                `;

                const overlay = new window.kakao.maps.CustomOverlay({
                    content: detailCard,
                    position: centerPosition,
                    yAnchor: 1.3,
                });

                // 처음에는 열어둠
                overlay.setMap(map);

                // 마커 클릭 시 다시 열기
                window.kakao.maps.event.addListener(marker, 'click', () => {
                    overlay.setMap(map);
                });

                // 주소 복사 및 닫기 버튼 이벤트 연결
                setTimeout(() => {
                    const copyBtn = document.getElementById('btn-copy-stay-addr');
                    const closeXBtn = document.getElementById('btn-close-detail-overlay');
                    const closeBottomBtn = document.getElementById('btn-close-bottom');

                    if (copyBtn && stay.addr) {
                        copyBtn.onclick = () => {
                            navigator.clipboard.writeText(stay.addr as string);
                            alert('주소가 클립보드에 복사되었습니다.');
                        };
                    }
                    if (closeXBtn) {
                        closeXBtn.onclick = () => overlay.setMap(null);
                    }
                    if (closeBottomBtn) {
                        closeBottomBtn.onclick = () => overlay.setMap(null);
                    }
                }, 0);

                return;
            }

            // =========================================================
            // 💡 [케이스 B] 검색/홈페이지 지도 모드 (mode === 'search')
            // : 숙소가 1개든 여러 개든 숙박종류 + 이름 + 주소 + 가격 + 상세보기 버튼 전체 노출!
            // =========================================================
            const clusterer = new window.kakao.maps.MarkerClusterer({
                map: map,
                averageCenter: true,
                minLevel: 6,
                disableClickZoom: false,
            });

            let currentOverlay: any = null;

            const markers = validStays.map((stay) => {
                const lat = parseFloat(stay.mapY!);
                const lng = parseFloat(stay.mapX!);
                const position = new window.kakao.maps.LatLng(lat, lng);

                const marker = new window.kakao.maps.Marker({
                    position: position,
                });

                // 카드형 오버레이 UI 엘리먼트 생성
                const content = document.createElement('div');
                content.style.cssText = `
                    background: #ffffff;
                    border-radius: 14px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
                    border: 1px solid #cbd5e1;
                    padding: 14px 16px;
                    width: 230px;
                    position: relative;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                `;

                content.innerHTML = `
                    <div style="font-size: 11px; color: #0f766e; font-weight: 700; margin-bottom: 2px;">
                        ${getLodgingTypeName(stay.lodgingType)}
                    </div>
                    <strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${stay.title}
                    </strong>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.3; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${stay.addr || ''}
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #123f4d; margin-bottom: 10px;">
                        ${money(stay.basePrice)} <span style="font-size: 11px; font-weight: 400; color: #94a3b8;">/ 1박</span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button id="btn-detail-${stay.contentId}" style="
                            flex: 1;
                            padding: 7px 0;
                            background-color: #123f4d;
                            color: #ffffff;
                            border: none;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            상세보기
                        </button>
                        <button id="btn-close-${stay.contentId}" style="
                            padding: 7px 10px;
                            background-color: #f1f5f9;
                            color: #475569;
                            border: 1px solid #cbd5e1;
                            border-radius: 6px;
                            font-size: 12px;
                            cursor: pointer;
                        ">
                            닫기
                        </button>
                    </div>
                `;

                const overlay = new window.kakao.maps.CustomOverlay({
                    content: content,
                    position: position,
                    yAnchor: 1.25,
                });

                const showOverlay = () => {
                    if (currentOverlay) {
                        currentOverlay.setMap(null);
                    }
                    overlay.setMap(map);
                    currentOverlay = overlay;

                    setTimeout(() => {
                        const detailBtn = document.getElementById(`btn-detail-${stay.contentId}`);
                        const closeBtn = document.getElementById(`btn-close-${stay.contentId}`);

                        if (detailBtn) {
                            detailBtn.onclick = () => navigate(`/stays/${stay.contentId}`);
                        }
                        if (closeBtn) {
                            closeBtn.onclick = () => overlay.setMap(null);
                        }
                    }, 0);
                };

                window.kakao.maps.event.addListener(marker, 'click', showOverlay);

                // 💡 만약 검색 결과가 딱 1곳뿐이라면 클릭하지 않아도 카드 오버레이를 자동으로 즉시 열어둠!
                if (isSingleStay) {
                    showOverlay();
                }

                return marker;
            });

            // 검색 결과가 1개일 땐 마커를 지도에 직접 찍고, 2개 이상일 땐 클러스터러 적용
            if (isSingleStay) {
                markers[0].setMap(map);
            } else {
                clusterer.addMarkers(markers);
            }
        });
    }, [isLoaded, stays, level, mode, navigate]);

    return (
        <div
            ref={mapContainerRef}
            style={{
                width: '100%',
                height: height,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {!isLoaded && (
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                    지도를 불러오는 중입니다...
                </span>
            )}
        </div>
    );
}