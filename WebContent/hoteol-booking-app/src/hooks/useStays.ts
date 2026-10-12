import { useEffect, useState } from 'react';
import { fetchStays } from '../data/stays';
import type { Stay } from '../types/stay';

export function useStays() {
  const [region, setRegion] = useState('전체 지역');
  const [type, setType] = useState('전체 숙박');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [appliedCheckIn, setAppliedCheckIn] = useState<string>('');
  const [appliedCheckOut, setAppliedCheckOut] = useState<string>('');
  const [appliedGuests, setAppliedGuests] = useState<number | undefined>(undefined);

  const [stays, setStays] = useState<Stay[]>([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchStays(region, type, term, appliedCheckIn, appliedCheckOut, appliedGuests)
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
  }, [region, type, term, appliedCheckIn, appliedCheckOut, appliedGuests]);

  const selectRegion = (value: string) => {
    setRegion(value);
    document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const search = (inDate?: string, outDate?: string, guestsCount?: number) => {
    setTerm(query);
    if (inDate !== undefined) setAppliedCheckIn(inDate);
    if (outDate !== undefined) setAppliedCheckOut(outDate);
    if (guestsCount !== undefined) setAppliedGuests(guestsCount);
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