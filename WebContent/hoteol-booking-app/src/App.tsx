import './App.css';
import ApiTest from './components/ApiTest';

function App() {
    return (
        <div className="App">
            {/* 개발/연동 확인용 컴포넌트 (추후 주석 처리하거나 제거) */}
            <ApiTest />

            <header style={{ textAlign: 'center', marginTop: '40px' }}>
                <h1>제주 호텔 예약 시스템</h1>
                <p>숙소 목록 및 검색 기능이 이곳에 구성됩니다.</p>
            </header>
        </div>
    );
}

export default App;