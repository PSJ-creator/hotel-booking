import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TourSummary } from '../api/tours';

declare const window: typeof globalThis & {
    kakao: any;
};

interface KakaoTourMapProps {
    tours: TourSummary[];
    level?: number;
    height?: string;
    mode?: 'search' | 'detail';
    onNavigateDetail?: () => void;
}

export function KakaoTourMap({
                                 tours,
                                 level,
                                 height = '520px',
                                 mode = 'search',
                                 onNavigateDetail
                             }: KakaoTourMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    const onNavigateDetailRef = useRef(onNavigateDetail);
    const navigateRef = useRef(navigate);

    useEffect(() => {
        onNavigateDetailRef.current = onNavigateDetail;
        navigateRef.current = navigate;
    }, [onNavigateDetail, navigate]);


    // 1. 카카오 지도 SDK 동적 로드
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

    // 2. 마커 및 커스텀 오버레이 렌더링
    useEffect(() => {
        if (!isLoaded || !window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;

            const validTours = tours.filter(
                (t) => t.mapX && t.mapY && !isNaN(Number(t.mapX)) && !isNaN(Number(t.mapY))
            );

            const isDetailPage = mode === 'detail';
            const isSingleTour = validTours.length === 1;

            const centerPosition = (isDetailPage || isSingleTour) && validTours.length > 0
                ? new window.kakao.maps.LatLng(
                    parseFloat(validTours[0].mapY!),
                    parseFloat(validTours[0].mapX!)
                )
                : new window.kakao.maps.LatLng(33.3617, 126.5292);

            const zoomLevel = level ?? (isDetailPage ? 4 : isSingleTour ? 6 : 9);

            const map = new window.kakao.maps.Map(mapContainerRef.current, {
                center: centerPosition,
                level: zoomLevel,
            });

            // [케이스 A] 관광지 상세페이지 하단 지도 모드
            if (isDetailPage && validTours.length > 0) {
                const tour = validTours[0];
                const marker = new window.kakao.maps.Marker({
                    position: centerPosition,
                    map: map,
                });

                const fullAddr = `${tour.addr1 || ''} ${tour.addr2 || ''}`.trim();

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
                `;

                detailCard.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                        <span style="font-size: 11px; color: #0f766e; font-weight: 700;">JEJU ATTRACTION</span>
                        <button id="btn-close-tour-detail-overlay" style="
                            background: none; border: none; font-size: 14px; color: #94a3b8; cursor: pointer; padding: 0 0 0 8px; line-height: 1;
                        ">✕</button>
                    </div>
                    <strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">
                        ${tour.title}
                    </strong>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.4; margin-bottom: 8px; word-break: keep-all;">
                        ${fullAddr || '등록된 주소 정보 없음'}
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button id="btn-copy-tour-addr" style="
                            flex: 1; padding: 6px 0; background-color: #f1f5f9; color: #123f4d;
                            border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;
                        ">주소 복사</button>
                        <button id="btn-close-tour-bottom" style="
                            padding: 6px 12px; background-color: #ffffff; color: #64748b;
                            border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; cursor: pointer;
                        ">닫기</button>
                    </div>
                `;

                const overlay = new window.kakao.maps.CustomOverlay({
                    content: detailCard,
                    position: centerPosition,
                    yAnchor: 1.3,
                });

                overlay.setMap(map);

                window.kakao.maps.event.addListener(marker, 'click', () => {
                    overlay.setMap(map);
                });

                setTimeout(() => {
                    const copyBtn = document.getElementById('btn-copy-tour-addr');
                    const closeXBtn = document.getElementById('btn-close-tour-detail-overlay');
                    const closeBottomBtn = document.getElementById('btn-close-tour-bottom');

                    if (copyBtn && fullAddr) {
                        copyBtn.onclick = () => {
                            navigator.clipboard.writeText(fullAddr);
                            alert('주소가 클립보드에 복사되었습니다.');
                        };
                    }
                    if (closeXBtn) closeXBtn.onclick = () => overlay.setMap(null);
                    if (closeBottomBtn) closeBottomBtn.onclick = () => overlay.setMap(null);
                }, 0);

                return;
            }

            // [케이스 B] 관광 지도 모달 모드 (전체 관광지 탐색)
            const clusterer = new window.kakao.maps.MarkerClusterer({
                map: map,
                averageCenter: true,
                minLevel: 6,
                disableClickZoom: false,
            });

            let currentOverlay: any = null;

            const markers = validTours.map((tour) => {
                const lat = parseFloat(tour.mapY!);
                const lng = parseFloat(tour.mapX!);
                const position = new window.kakao.maps.LatLng(lat, lng);

                const marker = new window.kakao.maps.Marker({ position });

                const fullAddr = `${tour.addr1 || ''} ${tour.addr2 || ''}`.trim();
                const thumbHtml = tour.firstImage
                    ? `<div style="width: 100%; height: 100px; border-radius: 8px; background-image: url('${tour.firstImage}'); background-size: cover; background-position: center; margin-bottom: 8px; border: 1px solid #e2e8f0;"></div>`
                    : '';

                const content = document.createElement('div');
                content.style.cssText = `
                    background: #ffffff;
                    border-radius: 14px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
                    border: 1px solid #cbd5e1;
                    padding: 12px 14px;
                    width: 240px;
                    position: relative;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                `;

                content.innerHTML = `
                    ${thumbHtml}
                    <div style="font-size: 11px; color: #0f766e; font-weight: 700; margin-bottom: 2px;">
                        제주 관광명소
                    </div>
                    <strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${tour.title}
                    </strong>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.3; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${fullAddr || '제주특별자치도'}
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button id="btn-tour-detail-${tour.contentId}" style="
                            flex: 1; padding: 7px 0; background-color: #123f4d; color: #ffffff;
                            border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
                        ">
                            상세보기
                        </button>
                        <button id="btn-tour-close-${tour.contentId}" style="
                            padding: 7px 10px; background-color: #f1f5f9; color: #475569;
                            border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; cursor: pointer;
                        ">
                            닫기
                        </button>
                    </div>
                `;

                const overlay = new window.kakao.maps.CustomOverlay({
                    content: content,
                    position: position,
                    yAnchor: 1.15,
                });

                const showOverlay = () => {
                    if (currentOverlay) currentOverlay.setMap(null);
                    overlay.setMap(map);
                    currentOverlay = overlay;

                    setTimeout(() => {
                        const detailBtn = document.getElementById(`btn-tour-detail-${tour.contentId}`);
                        const closeBtn = document.getElementById(`btn-tour-close-${tour.contentId}`);

                        if (detailBtn) {
                            detailBtn.onclick = () => {
                                if (onNavigateDetailRef.current) onNavigateDetailRef.current();
                                navigateRef.current(`/tours/${tour.contentId}`);
                            };
                        }
                        if (closeBtn) {
                            closeBtn.onclick = () => overlay.setMap(null);
                        }
                    }, 0);
                };

                window.kakao.maps.event.addListener(marker, 'click', showOverlay);

                if (isSingleTour) showOverlay();
                return marker;
            });

            if (isSingleTour && markers.length > 0) {
                markers[0].setMap(map);
            } else if (markers.length > 0) {
                clusterer.addMarkers(markers);
            }
        });
    }, [isLoaded, tours, level, mode]);

    return (
        <div
            ref={mapContainerRef}
            style={{
                width: '100%',
                height: height,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {!isLoaded && (
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                    관광 지도를 불러오는 중입니다...
                </span>
            )}
        </div>
    );
}