import { useEffect, useState } from 'react';
import { fetchStays } from '../data/stays';
import type { Stay } from '../types/stay';

export function useStays() {
  const [region, setRegion] = useState('전체 지역');
  const [type, setType] = useState('전체 숙박');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [stays, setStays] = useState<Stay[]>([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // 선택된 지역, 유형, 검색어가 바뀔 때마다 스프링 API 호출
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchStays(region, type, term)
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
  }, [region, type, term]);

  const selectRegion = (value: string) => {
    setRegion(value);
    document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const search = () => {
    setTerm(query);
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