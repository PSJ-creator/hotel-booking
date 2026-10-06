import { useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

interface DetailPhotoGalleryProps {
    images: string[];
    emptyText?: string;
    modalTitle?: string;
    externalPreviewImage?: string | null; // 객실 사진 등 외부에서 클릭한 1장 확대용
    onCloseExternalPreview?: () => void;
}

export function DetailPhotoGallery({
                                       images,
                                       emptyText = '등록된 이미지가 없습니다.',
                                       modalTitle = '전체 사진',
                                       externalPreviewImage,
                                       onCloseExternalPreview
                                   }: DetailPhotoGalleryProps) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [internalPreview, setInternalPreview] = useState<string | null>(null);

    const activePreview = externalPreviewImage || internalPreview;
    const mainImages = images.slice(0, 5);

    const closePreview = () => {
        setInternalPreview(null);
        if (onCloseExternalPreview) onCloseExternalPreview();
    };

    useEffect(() => {
        if (isGalleryOpen || Boolean(activePreview)) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isGalleryOpen, activePreview]);

    return (
        <>
            {/* 1. 상단 5분할 사진 배너 */}
            <section style={{ position: 'relative', marginBottom: '24px' }}>
                {mainImages.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: mainImages.length > 1 ? '1.2fr 1fr' : '1fr',
                            gap: '8px',
                            height: '420px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9'
                        }}
                    >
                        <div
                            onClick={() => setInternalPreview(mainImages[0])}
                            style={{
                                backgroundImage: `url(${mainImages[0]})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.94')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        />

                        {mainImages.length > 1 && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gridTemplateRows: '1fr 1fr',
                                    gap: '8px',
                                    height: '100%'
                                }}
                            >
                                {[1, 2, 3, 4].map((idx) => {
                                    const imgUrl = mainImages[idx];
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => imgUrl && setInternalPreview(imgUrl)}
                                            style={{
                                                backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
                                                backgroundColor: '#e2e8f0',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                height: '100%',
                                                cursor: imgUrl ? 'pointer' : 'default',
                                                transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (imgUrl) e.currentTarget.style.opacity = '0.94';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (imgUrl) e.currentTarget.style.opacity = '1';
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        style={{
                            height: '320px',
                            borderRadius: '16px',
                            backgroundColor: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8'
                        }}
                    >
                        {emptyText}
                    </div>
                )}

                {images.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setIsGalleryOpen(true)}
                        style={{
                            position: 'absolute',
                            right: '16px',
                            bottom: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            borderRadius: '24px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <ImageIcon size={16} />
                        전체 사진 ({images.length})
                    </button>
                )}
            </section>

            {/* 2. 전체 사진 모아보기 그리드 모달 */}
            {isGalleryOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setIsGalleryOpen(false)}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '960px',
                            maxHeight: '90vh',
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '18px 24px',
                                borderBottom: '1px solid #e2e8f0'
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
                                    {modalTitle} <span style={{ color: '#0f766e', fontSize: '15px' }}>({images.length})</span>
                                </h3>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    사진을 클릭하면 크게 볼 수 있습니다.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsGalleryOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div
                            style={{
                                padding: '24px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '14px'
                            }}
                        >
                            {images.map((url, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setInternalPreview(url)}
                                    style={{
                                        width: '100%',
                                        height: '190px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        backgroundColor: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        cursor: 'zoom-in',
                                        transition: 'transform 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                                >
                                    <img
                                        src={url}
                                        alt={`gallery-${idx}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. 클릭한 사진 1장 중앙 확대 팝업 (Lightbox) */}
            {activePreview && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.86)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 4000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        cursor: 'zoom-out'
                    }}
                    onClick={closePreview}
                >
                    <button
                        type="button"
                        onClick={closePreview}
                        aria-label="사진 닫기"
                        style={{
                            position: 'absolute',
                            top: '24px',
                            right: '24px',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.3)',
                            backgroundColor: 'rgba(15, 23, 42, 0.7)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>

                    <img
                        src={activePreview}
                        alt="확대 사진"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '88vh',
                            objectFit: 'contain',
                            borderRadius: '14px',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                            backgroundColor: '#0f172a',
                            cursor: 'default'
                        }}
                    />
                </div>
            )}
        </>
    );
}