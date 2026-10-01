import axios from 'axios';
import type { Stay } from '../types/stay';

// 1. 지역 필터
export const regions = [
 '전체 지역',
 '제주시',
 '애월·한림',
 '함덕·구좌',
 '서귀포·중문',
 '성산·표선',
] as const;

// 2. 숙박 유형 필터
export const types = [
 '전체 숙박',
 '호텔',
 '콘도/리조트',
 '펜션/풀빌라',
 '모텔',
 '캠핑/글램핑',
 '게스트하우스/호스텔',
] as const;

// 3. 메인 추천 여행지 배너
export const destinations = [
 { name: '애월·한림', note: '해안도로와 석양', className: 'spot-a' },
 { name: '서귀포·중문', note: '폭포와 남쪽 바다', className: 'spot-b' },
 { name: '성산·표선', note: '일출과 오름', className: 'spot-c' },
];

// 4. 금액 포맷팅 헬퍼
export const money = (n?: number) => {
 if (!n || n <= 0) return '요금 문의';
 return new Intl.NumberFormat('ko-KR').format(n) + '원';
};

// 5. DB 코드(AC01~AC06)를 한글 숙박 유형명으로 변환
export const getLodgingTypeName = (code?: string): string => {
 switch (code) {
  case 'AC01': return '호텔';
  case 'AC02': return '콘도미니엄';
  case 'AC03': return '펜션/민박';
  case 'AC04': return '모텔';
  case 'AC05': return '캠핑';
  case 'AC06': return '호스텔';
  default: return code || '숙소';
 }
};

// 6. 지역 필터명을 백엔드 검색 키워드로 매핑
export const mapRegionToKeyword = (region: string): string => {
 if (region === '전체 지역' || !region) return '';
 if (region === '애월·한림') return '애월';
 if (region === '함덕·구좌') return '구좌';
 if (region === '서귀포·중문') return '서귀포';
 if (region === '성산·표선') return '성산';
 return region; // '제주시' 등
};

// 7. 숙박 유형명을 백엔드 파라미터(AC01~AC06)로 매핑
export const mapTypeToKeyword = (type: string): string => {
 if (!type || type === '전체 숙박') return '';
 if (type === '호텔') return 'AC01';
 if (type.includes('콘도') || type.includes('리조트')) return 'AC02';
 if (type.includes('펜션')) return 'AC03';
 if (type.includes('모텔')) return 'AC04';
 if (type.includes('캠핑')) return 'AC05';
 if (type.includes('호스텔') || type.includes('게스트하우스')) return 'AC06';
 return type;
};

// 8. 백엔드 숙소 목록 비동기 조회 함수
export const fetchStays = async (
    region?: string,
    type?: string,
    query?: string,
    checkIn?: string,
    checkOut?: string,
    guests?: number // 💡 추가
): Promise<Stay[]> => {
 const params: Record<string, string | number> = {};

 const regionKeyword = mapRegionToKeyword(region || '');
 if (regionKeyword) params.region = regionKeyword;

 const typeKeyword = mapTypeToKeyword(type || '');
 if (typeKeyword) params.type = typeKeyword;

 if (query && query.trim()) params.query = query.trim();
 if (checkIn && checkIn.trim()) params.checkIn = checkIn.trim();
 if (checkOut && checkOut.trim()) params.checkOut = checkOut.trim();
 if (guests && guests > 0) params.guests = guests; // 💡 추가

 const response = await axios.get<Stay[]>('/api/v1/stays', { params });
 return response.data;
};