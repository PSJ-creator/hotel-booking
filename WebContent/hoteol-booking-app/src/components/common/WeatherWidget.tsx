import { useEffect, useState } from 'react';
import {
    Cloud,
    Sun,
    CloudSun,
    CloudRain,
    CloudSnow,
    CloudLightning,
    CloudDrizzle,
    CloudFog
} from 'lucide-react';

interface WeatherData {
    temp: number;
    description: string;
    main: string;
    iconCode: string;
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchWeather = async () => {
            try {
                let apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

                if (!apiKey) {
                    const keyRes = await fetch('/api/v1/accommodations/weather-key');
                    if (keyRes.ok) {
                        const keyData = await keyRes.json();
                        apiKey = keyData.apiKey;
                    }
                }

                if (!apiKey) {
                    if (isMounted) setLoading(false);
                    return;
                }
                const weatherRes = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=Jeju&appid=${apiKey}&units=metric&lang=kr`
                );

                if (!weatherRes.ok) {
                    throw new Error('날씨 API 호출 실패');
                }

                const data = await weatherRes.json();

                if (isMounted) {
                    setWeather({
                        temp: Math.round(data.main.temp),
                        description: data.weather[0]?.description || '',
                        main: data.weather[0]?.main || 'Clouds',
                        iconCode: data.weather[0]?.icon || '01d',
                    });
                }
            } catch (err) {
                console.error('날씨 정보를 불러오지 못했습니다:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchWeather();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading || !weather) {
        return null;
    }
    const renderWeatherIcon = () => {
        const main = weather.main.toLowerCase();
        const iconCode = weather.iconCode;
        const iconSize = 19;
        if (main.includes('clear')) {
            return <Sun size={iconSize} color="#f59e0b" fill="#fef3c7" strokeWidth={2} />;
        }
        if (main.includes('cloud')) {
            if (iconCode.startsWith('02')) {
                return <CloudSun size={iconSize} color="#475569" fill="#e2e8f0" strokeWidth={2} />;
            }
            return <Cloud size={iconSize} color="#64748b" fill="#cbd5e1" strokeWidth={2} />;
        }
        if (main.includes('rain')) {
            return <CloudRain size={iconSize} color="#0284c7" fill="#e0f2fe" strokeWidth={2} />;
        }
        if (main.includes('drizzle')) {
            return <CloudDrizzle size={iconSize} color="#38bdf8" strokeWidth={2} />;
        }
        if (main.includes('snow')) {
            return <CloudSnow size={iconSize} color="#67e8f9" strokeWidth={2} />;
        }
        if (main.includes('thunderstorm')) {
            return <CloudLightning size={iconSize} color="#eab308" strokeWidth={2} />;
        }
        return <CloudFog size={iconSize} color="#94a3b8" strokeWidth={2} />;
    };

    return (
        <div
            title={`제주도 현재 날씨: ${weather.description}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                backgroundColor: 'rgba(18, 63, 77, 0.05)',
                borderRadius: '24px',
                border: '1px solid #d5e0df',
                fontSize: '13px',
                fontWeight: 700,
                color: '#17343d',
                userSelect: 'none',
                cursor: 'default',
                height: '34px',
                boxSizing: 'border-box',
            }}
        >
            <span style={{ fontSize: '12px', color: '#0f766e', fontWeight: 800 }}>제주</span>

            {/* 💡 구름/날씨 아이콘 */}
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderWeatherIcon()}
            </span>

            <span style={{ fontSize: '13px', letterSpacing: '-0.3px' }}>{weather.temp}°C</span>
        </div>
    );
}