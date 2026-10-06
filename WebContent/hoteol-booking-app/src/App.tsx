import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

// 1. 메인 홈
import { HomePage } from "./pages/HomePage";

// 2. 인증/회원 (auth)
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { FindPasswordPage } from "./pages/auth/FindPasswordPage";
import { ProfileEditPage } from "./pages/auth/ProfileEditPage";
import { KakaoCallback } from "./pages/auth/KakaoCallback";

// 3. 숙소 (stay)
import { StayDetailPage } from "./pages/stay/StayDetailPage";
import { WishlistPage } from "./pages/stay/WishlistPage";

// 4. 관광지 (tour)
import { TourDetailPage } from "./pages/tour/TourDetailPage";
import { TourWishlistPage } from "./pages/tour/TourWishlistPage";

// 5. 예약/결제 (reservation)
import { ReservationPage } from "./pages/reservation/ReservationPage";
import { PaymentSuccessPage } from "./pages/reservation/PaymentSuccessPage";
import { MyReservationsPage } from "./pages/reservation/MyReservationsPage";

// 6. 호스트 파트너 센터 (host)
import { HostAccommodationPage } from "./pages/host/HostAccommodationPage";
import { HostReservationsPage } from "./pages/host/HostReservationsPage";
import { HostReviewsPage } from "./pages/host/HostReviewsPage";

// 7. 총괄 관리자 센터 (admin)
import { AdminAccommodationsPage } from "./pages/admin/AdminAccommodationsPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 메인 홈 */}
                <Route path="/" element={<HomePage />} />

                {/* 인증/회원 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/find-password" element={<FindPasswordPage />} />
                <Route path="/profile" element={<ProfileEditPage />} />
                <Route path="/oauth/callback" element={<KakaoCallback />} />

                {/* 숙소 */}
                <Route path="/stays/:contentId" element={<StayDetailPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />

                {/* 관광지 */}
                <Route path="/tours/:contentId" element={<TourDetailPage />} />
                <Route path="/tour-wishlist" element={<TourWishlistPage />} />

                {/* 예약/결제 */}
                <Route path="/reservation" element={<ReservationPage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/my-reservations" element={<MyReservationsPage />} />

                {/* 호스트 파트너 센터 */}
                <Route path="/host/accommodation" element={<HostAccommodationPage />} />
                <Route path="/host/reservations" element={<HostReservationsPage />} />
                <Route path="/host/reviews" element={<HostReviewsPage />} />

                {/* 총괄 관리자 센터 */}
                <Route path="/admin/accommodations" element={<AdminAccommodationsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;