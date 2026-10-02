import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { HomePage } from "./pages/HomePage.tsx";
import { SignupPage } from "./pages/SignupPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { KakaoCallback } from "./pages/KakaoCallback.tsx";
import { StayDetailPage } from "./pages/StayDetailPage.tsx";
import { ReservationPage } from "./pages/ReservationPage.tsx";
import { FindPasswordPage } from "./pages/FindPasswordPage.tsx";
import {WishlistPage} from "./pages/WishlistPage.tsx";
import {ProfileEditPage} from "./pages/ProfileEditPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/find-password" element={<FindPasswordPage />} />
                <Route path="/oauth/callback" element={<KakaoCallback />} />
                <Route path="/stays/:contentId" element={<StayDetailPage />} />
                <Route path="/reservation" element={<ReservationPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<ProfileEditPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;