import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import type { Stay } from '../../types/stay.ts';
import { money, getLodgingTypeName } from '../../data/stays.ts';

declare const window: typeof globalThis & {
    kakao: any;
};

interface KakaoStayMapProps {
    stays: Stay[];
    level?: number;
    height?: string;
    mode?: 'search' | 'detail';
    zoomable?: boolean;
}

export function KakaoStayMap({
                                 stays,
                                 level,
                                 height = '520px',
                                 mode = 'search',
                                 zoomable = true
                             }: KakaoStayMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);
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
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=clusterer,services&autoload=false`;
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
    useEffect(() => {
        if (!isLoaded || !window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;

            const validStays = stays.filter(
                (s) => s.mapX && s.mapY && !isNaN(Number(s.mapX)) && !isNaN(Number(s.mapY))
            );

            const isDetailPage = mode === 'detail';
            const isSingleStay = validStays.length === 1;

            const centerPosition = (isDetailPage || isSingleStay) && validStays.length > 0
                ? new window.kakao.maps.LatLng(
                    parseFloat(validStays[0].mapY!),
                    parseFloat(validStays[0].mapX!)
                )
                : new window.kakao.maps.LatLng(33.3617, 126.5292);

            const zoomLevel = level ?? (isDetailPage ? 4 : isSingleStay ? 6 : 9);

            const options = {
                center: centerPosition,
                level: zoomLevel,
            };
            const map = new window.kakao.maps.Map(mapContainerRef.current, options);
            mapInstanceRef.current = map;
            map.setZoomable(zoomable);
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
                    z-index: 9999;
                `;

                const uid = `${stay.contentId}-${zoomable ? 'popup' : 'inline'}`;

                detailCard.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                        <span style="font-size: 11px; color: #0f766e; font-weight: 700;">
                            ${getLodgingTypeName(stay.lodgingType)}
                        </span>
                        <button id="btn-close-detail-overlay-${uid}" style="
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
                        <button id="btn-copy-stay-addr-${uid}" style="
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
                        <button id="btn-close-bottom-${uid}" style="
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
                    zIndex: 9999,
                    clickable: true,
                });

                overlay.setMap(map);

                window.kakao.maps.event.addListener(marker, 'click', () => {
                    overlay.setMap(map);
                });

                setTimeout(() => {
                    const copyBtn = document.getElementById(`btn-copy-stay-addr-${uid}`);
                    const closeXBtn = document.getElementById(`btn-close-detail-overlay-${uid}`);
                    const closeBottomBtn = document.getElementById(`btn-close-bottom-${uid}`);

                    if (copyBtn && stay.addr) {
                        copyBtn.onclick = (e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(stay.addr as string);
                            alert('주소가 클립보드에 복사되었습니다.');
                        };
                    }
                    if (closeXBtn) {
                        closeXBtn.onclick = (e) => {
                            e.stopPropagation();
                            overlay.setMap(null);
                        };
                    }
                    if (closeBottomBtn) {
                        closeBottomBtn.onclick = (e) => {
                            e.stopPropagation();
                            overlay.setMap(null);
                        };
                    }
                }, 0);

                return;
            }
            const clusterer = new window.kakao.maps.MarkerClusterer({
                map: map,
                averageCenter: true,
                minLevel: 6,
                disableClickZoom: false,
            });

            let currentOverlay: any = null;
            let currentActiveMarker: any = null;

            const closeCurrentOverlay = () => {
                if (currentOverlay) {
                    currentOverlay.setMap(null);
                    currentOverlay = null;
                }
                if (currentActiveMarker) {
                    currentActiveMarker.setZIndex(1);
                    currentActiveMarker = null;
                }
            };

            window.kakao.maps.event.addListener(map, 'click', closeCurrentOverlay);
            window.kakao.maps.event.addListener(map, 'zoom_start', closeCurrentOverlay);

            const markers = validStays.map((stay) => {
                const lat = parseFloat(stay.mapY!);
                const lng = parseFloat(stay.mapX!);
                const position = new window.kakao.maps.LatLng(lat, lng);

                const marker = new window.kakao.maps.Marker({
                    position: position,
                    zIndex: 1,
                });

                const content = document.createElement('div');
                content.style.cssText = `
                    background: #ffffff;
                    border-radius: 14px;
                    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
                    border: 1.5px solid #0f766e;
                    padding: 14px 16px;
                    width: 230px;
                    position: relative;
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                `;

                content.onmousedown = (e) => e.stopPropagation();
                content.onclick = (e) => e.stopPropagation();

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
                    zIndex: 9999,
                    clickable: true,
                });

                const showOverlay = () => {
                    closeCurrentOverlay();
                    marker.setZIndex(100);
                    overlay.setZIndex(9999);
                    overlay.setMap(map);
                    currentOverlay = overlay;
                    currentActiveMarker = marker;

                    setTimeout(() => {
                        const detailBtn = document.getElementById(`btn-detail-${stay.contentId}`);
                        const closeBtn = document.getElementById(`btn-close-${stay.contentId}`);

                        if (detailBtn) {
                            detailBtn.onclick = (e) => {
                                e.stopPropagation();
                                navigate(`/stays/${stay.contentId}`);
                            };
                        }
                        if (closeBtn) {
                            closeBtn.onclick = (e) => {
                                e.stopPropagation();
                                closeCurrentOverlay();
                            };
                        }
                    }, 0);
                };

                window.kakao.maps.event.addListener(marker, 'click', showOverlay);

                if (isSingleStay) {
                    showOverlay();
                }

                return marker;
            });

            if (isSingleStay && markers.length > 0) {
                markers[0].setMap(map);
            } else if (markers.length > 0) {
                clusterer.addMarkers(markers);
            }
        });
    }, [isLoaded, stays, level, mode, zoomable, navigate]);
    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setLevel(mapInstanceRef.current.getLevel() - 1, { animate: true });
        }
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setLevel(mapInstanceRef.current.getLevel() + 1, { animate: true });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height }}>
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '100%',
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

            {/* 우측 하단 확대(+) / 축소(-) 컨트롤 버튼 */}
            {isLoaded && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        right: '14px',
                        bottom: '14px',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #cbd5e1',
                        overflow: 'hidden',
                    }}
                >
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        title="지도 확대"
                        aria-label="지도 확대"
                        style={{
                            width: '36px',
                            height: '36px',
                            border: 'none',
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#123f4d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={handleZoomOut}
                        title="지도 축소"
                        aria-label="지도 축소"
                        style={{
                            width: '36px',
                            height: '36px',
                            border: 'none',
                            backgroundColor: '#ffffff',
                            color: '#123f4d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <Minus size={18} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
}