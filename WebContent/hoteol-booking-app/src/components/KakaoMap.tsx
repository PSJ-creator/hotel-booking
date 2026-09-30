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
}

// 발급받으신 자바스크립트 키
const KAKAO_MAP_KEY = '***REMOVED***';

export function KakaoStayMap({ stays, level, height = '520px' }: KakaoStayMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. 카카오 지도 SDK 동적 주입 (index.html 수정 불필요)
    useEffect(() => {
        const existingScript = document.getElementById('kakao-map-sdk');
        if (existingScript) {
            if (window.kakao && window.kakao.maps) {
                setIsLoaded(true);
            } else {
                existingScript.addEventListener('load', () => setIsLoaded(true));
            }
            return;
        }

        const script = document.createElement('script');
        script.id = 'kakao-map-sdk';
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=clusterer&autoload=false`;
        script.async = true;

        script.onload = () => {
            setIsLoaded(true);
        };

        document.head.appendChild(script);
    }, []);

    // 2. 스크립트 로드 완료 후 지도 및 마커 초기화
    useEffect(() => {
        if (!isLoaded || !window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;

            // 유효한 좌표를 가진 숙소 필터링
            const validStays = stays.filter(
                (s) => s.mapX && s.mapY && !isNaN(Number(s.mapX)) && !isNaN(Number(s.mapY))
            );

            // 단일 숙소(상세페이지) 여부 판단
            const isSingleStay = validStays.length === 1;

            // 중심 좌표: 1개면 해당 숙소 좌표, 여러 개면 제주도 중심
            const centerPosition = isSingleStay
                ? new window.kakao.maps.LatLng(
                    parseFloat(validStays[0].mapY!),
                    parseFloat(validStays[0].mapX!)
                )
                : new window.kakao.maps.LatLng(33.3617, 126.5292);

            // 줌 레벨: level props 우선 -> 없으면 단일 숙소는 4(약 1km), 목록은 9(광역)
            const zoomLevel = level ?? (isSingleStay ? 4 : 9);

            const options = {
                center: centerPosition,
                level: zoomLevel,
            };
            const map = new window.kakao.maps.Map(mapContainerRef.current, options);

            // 💡 [케이스 1] 상세페이지 (숙소 1개일 때): 클러스터러 없이 해당 좌표 핀 + 이름 말풍선 표시
            if (isSingleStay) {
                const stay = validStays[0];
                const marker = new window.kakao.maps.Marker({
                    position: centerPosition,
                    map: map,
                });

                const infowindow = new window.kakao.maps.InfoWindow({
                    content: `
                        <div style="padding: 7px 12px; font-size: 13px; font-weight: 600; color: #0f172a; white-space: nowrap; border-radius: 6px;">
                            ${stay.title}
                        </div>
                    `,
                });
                infowindow.open(map, marker);
                return; // 단일 숙소 세팅 완료
            }

            // 💡 [케이스 2] 홈페이지 (숙소 여러 개일 때): 마커 클러스터러 활성화
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

                // 오버레이 카드 UI
                const content = document.createElement('div');
                content.style.cssText = `
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
                    border: 1px solid #cbd5e1;
                    padding: 12px 14px;
                    width: 220px;
                    position: relative;
                    font-family: sans-serif;
                `;

                content.innerHTML = `
                    <div style="font-size: 11px; color: #0f766e; font-weight: 600; margin-bottom: 2px;">
                        ${getLodgingTypeName(stay.lodgingType)}
                    </div>
                    <strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${stay.title}
                    </strong>
                    <div style="font-size: 13px; font-weight: 700; color: #123f4d; margin-bottom: 8px;">
                        ${money(stay.basePrice)} <span style="font-size: 11px; font-weight: 400; color: #94a3b8;">/ 1박</span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button id="btn-detail-${stay.contentId}" style="
                            flex: 1;
                            padding: 6px 0;
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
                            padding: 6px 10px;
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

                window.kakao.maps.event.addListener(marker, 'click', () => {
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
                });

                return marker;
            });

            clusterer.addMarkers(markers);
        });
    }, [isLoaded, stays, level, navigate]);

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