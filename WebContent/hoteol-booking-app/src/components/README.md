<!-- src/components/README.md 예시 -->
# 📂 Components Directory Structure

이 폴더는 공통 및 기능별 UI 컴포넌트를 관리합니다.

## 폴더 분류 규칙
- `common/`: 전역에서 재사용되는 레이아웃 및 범용 UI (PageHeader, Footer, Gallery, Modals)
- `home/`: 메인 홈페이지(`HomePage`) 전용 UI (Navbar, SearchBar, Banner)
- `stay/`: 숙소 상세 및 숙소 찜 관련 UI (StayCard, RoomCard, StayReviewSection 등)
- `tour/`: 관광지 관련 UI (TourSlider, TourWishlistCard 등)
- `reservation/`: 게스트 예약 내역 관련 UI (MyReservationCard, ReviewWriteModal)
- `host/`: 숙소 관리자(호스트) 전용 관리 UI (HostRoomManager, HostReviewCard 등)
- `admin/`: 총괄 관리자 심사 관련 UI (PendingAccommodationCard, AdminRejectModal)

## 작성 규칙
1. 특정 도메인에 종속된 컴포넌트는 해당 도메인 폴더(`stay`, `tour` 등)에 배치합니다.
2. 2개 이상의 도메인에서 공통으로 쓰이는 컴포넌트만 `common/`에 배치합니다.