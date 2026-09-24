import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Menu,
  Search,
} from "lucide-react";
import { BookingModal } from "../components/BookingModal";
import { destinations, money, regions, types } from "../data/stays";
import { useHeroSlider } from "../hooks/useHeroSlider";
import { useReservation } from "../hooks/useReservation";
import { useStays } from "../hooks/useStays";

const heroTitles = [
  "제주에 머무는 시간,\n여행이 되다",
  "바다와 더 가까운\n제주의 하루",
  "오늘의 제주에서\n쉬어 가세요",
];

export function HomePage() {
  const {
    region,
    setRegion,
    type,
    setType,
    query,
    setQuery,
    result,
    loading,
    apiOnline,
    selectRegion,
    search,
  } = useStays();
  const { slide, previous, next } = useHeroSlider();
  const reservation = useReservation(apiOnline);
  const { open } = reservation;
  return (
    <>
      <header className="header">
        <div className="nav container">
          <a className="brand" href="#top" aria-label="제주에 머물다 홈">
            <span className="brand-mark">⌁</span>
            <span>
              제주에 머물다<small>JEJU STAY</small>
            </span>
          </a>
          <nav className="nav-links">
            <a href="#destinations">추천 여행지</a>
            <a href="#stays">숙소 찾기</a>
            <a href="#about">서비스 안내</a>
          </nav>
          <a className="nav-cta" href="#stays">
            제주 숙소 둘러보기 <ArrowRight size={16} />
          </a>
        </div>
      </header>
      <main id="top">
        <section className={`hero hero-${slide}`}>
          <div className="hero-image" />
          <div className="hero-shade" />
          <div className="container hero-inner">
            <div className="hero-copy">
              <div className="eyebrow light">ONLY JEJU · STAY & TRAVEL</div>
              <h1>{heroTitles[slide]}</h1>
              <p>가고 싶은 여행지를 찾고, 마음에 드는 숙소를 만나보세요.</p>
              <a className="hero-link" href="#stays">
                숙소 둘러보기 <ArrowRight size={18} />
              </a>
            </div>
            <div className="slide-control">
              <button aria-label="이전 배너" onClick={previous}>
                <ChevronLeft size={18} />
              </button>
              <span>
                0{slide + 1} <i /> 03
              </span>
              <button aria-label="다음 배너" onClick={next}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
        <section className="search-wrap container" aria-label="숙소 검색">
          <form
            className="search-panel"
            onSubmit={(e) => {
              e.preventDefault();
              search();
            }}
          >
            <div className="search-heading">
              <span>나에게 맞는 제주를 찾아보세요</span>
              <strong>어디로 떠나실까요?</strong>
            </div>
            <label className="search-field">
              <MapPin size={21} />
              <span>
                지역
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </span>
            </label>
            <label className="search-field">
              <Menu size={20} />
              <span>
                숙박 종류
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {types.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </span>
            </label>
            <label className="search-field keyword">
              <Search size={21} />
              <span>
                검색어
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="숙소 또는 여행지"
                />
              </span>
            </label>
            <button className="search-button" type="submit">
              숙소 검색 <ArrowRight size={18} />
            </button>
          </form>
        </section>
        <section id="destinations" className="section container">
          <div className="section-top">
            <div>
              <span className="eyebrow">DISCOVER JEJU</span>
              <h2>제주, 어디에 머물까요?</h2>
              <p>여행의 분위기를 정하면 숙소 고르기도 쉬워져요.</p>
            </div>
          </div>
          <div className="destination-grid">
            {destinations.map((d) => (
              <button
                key={d.name}
                className={`destination ${d.className}`}
                onClick={() => selectRegion(d.name)}
              >
                <span className="destination-image" />
                <span className="destination-content">
                  <small>JEJU ISLAND</small>
                  <strong>{d.name}</strong>
                  <span>
                    {d.note} <ArrowRight size={17} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section id="stays" className="section stay-section">
          <div className="container">
            <div className="section-top">
              <div>
                <span className="eyebrow">STAY IN JEJU</span>
                <h2>제주에서 쉬어 갈 곳</h2>
                <p>
                  {loading
                    ? "숙소 정보를 불러오는 중입니다."
                    : `${result.length}개의 숙소를 둘러보세요.`}
                </p>
              </div>
              <span className="sample-note">
                {!apiOnline && "화면 예시 숙소 · 실제 예약 준비 중"}
              </span>
            </div>
            <div className="category-row">
              <span>지역</span>
              <div className="chips">
                {regions.map((r) => (
                  <button
                    className={region === r ? "active" : ""}
                    key={r}
                    onClick={() => setRegion(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="category-row">
              <span>숙박 종류</span>
              <div className="chips">
                {types.map((t) => (
                  <button
                    className={type === t ? "active" : ""}
                    key={t}
                    onClick={() => setType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="stay-grid">
              {result.map((s, i) => (
                <article className="stay-card" key={s.id}>
                  <button
                    className={`stay-photo crop-${i % 3}`}
                    onClick={() => open(s)}
                    aria-label={`${s.name} 자세히 보기`}
                    style={{ backgroundImage: `url(${s.thumbnailUrl})` }}
                  >
                    <span className="photo-tag">{s.type}</span>
                  </button>
                  <div className="stay-info">
                    <div className="stay-location">
                      <MapPin size={15} />
                      {s.region} · {s.addressSido}
                    </div>
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                    <div className="stay-bottom">
                      <div>
                        <strong>{money(s.basePrice)}</strong>
                        <small> / 1박 기준가</small>
                      </div>
                      <button
                        onClick={() => open(s)}
                        aria-label={`${s.name} 예약 정보 보기`}
                      >
                        <ArrowRight size={19} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!result.length && (
              <div className="empty">
                선택한 조건의 숙소가 없습니다. 다른 지역이나 숙박 종류를 골라
                주세요.
              </div>
            )}
          </div>
        </section>
        <section id="about" className="bottom-banner">
          <div className="container">
            <div>
              <span className="eyebrow light">A LITTLE CLOSER TO JEJU</span>
              <h2>당신의 속도로, 제주를 만나세요.</h2>
              <p>머무는 곳에서 시작되는 여행의 좋은 순간들.</p>
            </div>
            <a href="#destinations">
              여행지 둘러보기 <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>
      <footer>
        <div className="container footer-inner">
          <div className="footer-brand">
            제주에 머물다<small>JEJU STAY</small>
          </div>
          <p>제주 여행지와 숙소를 둘러보는 예약 플랫폼</p>
          <p>© 2026 Jeju Stay</p>
        </div>
      </footer>
      <BookingModal reservation={reservation} />
    </>
  );
}
