import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { HomePage } from "./pages/HomePage.tsx";
import { SignupPage } from "./pages/SignupPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { KakaoCallback } from "./pages/KakaoCallback.tsx";
import { StayDetailPage } from "./pages/StayDetailPage.tsx";
import { ReservationPage } from "./pages/ReservationPage.tsx"; // 💡 추가

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/oauth/callback" element={<KakaoCallback />} />
                <Route path="/stays/:contentId" element={<StayDetailPage />} />
                <Route path="/reservation" element={<ReservationPage />} /> {/* 💡 추가 */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;