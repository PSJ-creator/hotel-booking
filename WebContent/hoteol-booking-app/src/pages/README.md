### 📂 `src/pages` 기능별 폴더 분리 구조


```text
src/pages/
├── HomePage.tsx                     # 🏠 메인 홈 (루트 유지)
│
├── auth/                            # 🔐 회원/인증 관련
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── FindPasswordPage.tsx
│   ├── ProfileEditPage.tsx
│   └── KakaoCallback.tsx            # ⚠️ (components에서 이쪽으로 이동!)
│
├── stay/                            # 🏨 숙소 탐색/상세/위시리스트
│   ├── StayDetailPage.tsx
│   └── WishlistPage.tsx
│
├── tour/                            # 🗺️ 관광지 탐색/상세/위시리스트
│   ├── TourDetailPage.tsx
│   └── TourWishlistPage.tsx
│
├── reservation/                     # 💳 예약/결제 관련
│   ├── ReservationPage.tsx
│   ├── PaymentSuccessPage.tsx
│   └── MyReservationsPage.tsx
│
├── host/                            # 🏢 호스트(파트너) 관리 센터
│   ├── HostAccommodationPage.tsx
│   ├── HostReservationsPage.tsx
│   └── HostReviewsPage.tsx
│
└── admin/                           # 🛡️ 총괄 관리자 센터
    └── AdminAccommodationsPage.tsx
