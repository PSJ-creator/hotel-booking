import { useEffect, useState } from 'react';
import { fetchStays } from '../data/stays';
import type { Stay } from '../types/stay';

export function useStays() {
  const [region, setRegion] = useState('전체 지역');
  const [type, setType] = useState('전체 숙박');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');

  // 💡 [신규 추가]: 검색에 적용될 체크인/체크아웃 날짜 상태
  const [appliedCheckIn, setAppliedCheckIn] = useState<string>('');
  const [appliedCheckOut, setAppliedCheckOut] = useState<string>('');

  const [stays, setStays] = useState<Stay[]>([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // 선택된 지역, 유형, 검색어가 바뀔 때마다 스프링 API 호출
  useEffect(() => {
    let active = true;
    setLoading(true);

    // 💡 [신규 교체]: 날짜 조건(appliedCheckIn, appliedCheckOut)을 함께 넘김
    fetchStays(region, type, term, appliedCheckIn, appliedCheckOut)
        .then(data => {
          if (active) {
            setStays(data);
            setApiOnline(true);
          }
        })
        .catch((err) => {
          console.error('숙소 로딩 실패:', err);
          if (active) setApiOnline(false);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

    return () => { active = false; };
  }, [region, type, term, appliedCheckIn, appliedCheckOut]); // 💡 의존성 배열에 날짜 추가

  const selectRegion = (value: string) => {
    setRegion(value);
    document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 💡 [신규 교체]: 검색 버튼 클릭 시 입력된 날짜를 확정하여 API 호출 트리거
  const search = (inDate?: string, outDate?: string) => {
    setTerm(query);
    if (inDate !== undefined) setAppliedCheckIn(inDate);
    if (outDate !== undefined) setAppliedCheckOut(outDate);
    document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    region,
    setRegion,
    type,
    setType,
    query,
    setQuery,
    result: stays,
    loading,
    apiOnline,
    selectRegion,
    search,
  };
}