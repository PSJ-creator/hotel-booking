import { useEffect, useMemo, useState } from 'react';
import { fetchStays } from '../api/stays';
import { sample } from '../data/stays';
import type { Stay } from '../types/stay';

export function useStays() {
  const [region, setRegion] = useState('전체 지역');
  const [type, setType] = useState('전체 숙박');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [stays, setStays] = useState<Stay[]>(sample);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStays()
      .then(data => { if (active) { setStays(data); setApiOnline(true); } })
      .catch(() => {}) // Keep the labeled sample catalog while Spring is unavailable.
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const result = useMemo(() => stays.filter(stay =>
    (region === '전체 지역' || stay.region === region) &&
    (type === '전체 숙박' || stay.type === type) &&
    (!term || `${stay.name} ${stay.region} ${stay.address} ${stay.nearby}`.toLowerCase().includes(term.toLowerCase()))
  ), [stays, region, type, term]);

  const selectRegion = (value: string) => {
    setRegion(value);
    document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const search = () => {
    setTerm(query);
    document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' });
  };

  return { region, setRegion, type, setType, query, setQuery, result, loading, apiOnline, selectRegion, search };
}
