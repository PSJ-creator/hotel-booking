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
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage.tsx";
import {ProfileEditPage} from "./pages/ProfileEditPage.tsx";
import {MyReservationsPage} from "./pages/MyReservationsPage.tsx";
import {HostReservationsPage} from "./pages/HostReservationsPage.tsx";
import {TourDetailPage} from "./pages/TourDetailPage.tsx";
import {TourWishlistPage} from "./pages/TourWishlistPage.tsx";
import {HostAccommodationPage} from "./pages/HostAccommodationPage.tsx";
import {AdminAccommodationsPage} from "./pages/AdminAccommodationsPage.tsx";
import {HostReviewsPage} from "./pages/HostReviewsPage.tsx";


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
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/my-reservations" element={<MyReservationsPage />} />
                <Route path="/host/reservations" element={<HostReservationsPage />} />
                <Route path="/tours/:contentId" element={<TourDetailPage />} />
                <Route path="/tour-wishlist" element={<TourWishlistPage />} />
                <Route path="/host/accommodation" element={<HostAccommodationPage />} />
                <Route path="/admin/accommodations" element={<AdminAccommodationsPage />} />
                <Route path="/host/reviews" element={<HostReviewsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;