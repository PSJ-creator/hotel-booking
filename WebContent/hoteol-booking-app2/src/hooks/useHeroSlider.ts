import { useEffect, useState } from 'react';

const slideCount = 3;

export function useHeroSlider() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSlide(current => (current + 1) % slideCount), 10000);
    return () => window.clearInterval(timer);
  }, []);
  const previous = () => setSlide(current => (current + slideCount - 1) % slideCount);
  const next = () => setSlide(current => (current + 1) % slideCount);
  return { slide, previous, next };
}
