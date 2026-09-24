import { BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css';
import {HomePage} from "./pages/HomePage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* 차후 <Route path="/stays/:id" element={<StayDetailPage />} /> 상세페이지, 넘어갈 페이지 추가 */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;