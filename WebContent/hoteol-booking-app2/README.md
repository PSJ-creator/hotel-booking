# 제주에 머물다

React + Vite + TypeScript 프런트엔드와 Spring Boot + MariaDB 예약 API의 시작 프로젝트입니다.

## 시작

- 프런트: `npm install && npm run dev` (http://localhost:5173)
- DB: MariaDB에 `jeju_stay` 데이터베이스를 생성하고 `spring-api/src/main/resources/schema.sql.example`을 실행합니다.
- API: Java 21, Gradle 8.5 이상. `cd spring-api && gradle bootRun` (http://localhost:8082). 환경 변수 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_ORIGIN`을 설정합니다.
- 개발 중 Vite `/api` 프록시는 8082로 연결됩니다. 배포 시 `VITE_API_BASE_URL`을 공개 HTTPS Spring API 주소로 설정하고 다시 빌드하세요. CORS `FRONTEND_ORIGIN`에도 사이트 주소를 등록해야 합니다.

## 데이터·흐름

`stay`에 지역(1단계), 숙박 종류(2단계), 숙소명, 시도/상세주소, 기준가, 썸네일 URL을 저장합니다. `stay_image`에 슬라이드 이미지와 정렬 순서를 저장합니다. `reservation`은 날짜, 인원, 예약자 이름, 연락처, 당시 기준가와 `REQUESTED` 상태를 기록합니다.

`GET /api/stays`는 공개 숙소 목록, `POST /api/reservations`는 예약 요청입니다. 예약 확인과 결제 기능은 포함되지 않습니다. 숙소당 예약 가능한 객실 1개로 가정하며 날짜 중복은 트랜잭션에서 방지합니다. 실제 운영에는 객실·재고, 날짜별 요금, 개인정보 처리 정책, 결제·취소·운영자 확인 흐름이 추가로 필요합니다.

API가 연결되지 않으면 화면에 예시 숙소가 표시되며 예약은 저장되지 않습니다. 예시 이름·가격은 실제 등록 상품이 아닙니다. 실제 숙소 데이터는 사업자가 사진 사용 권한과 가격을 확인한 뒤 DB에 등록해야 합니다.

## 프런트엔드 폴더 구성

- `src/pages/HomePage.tsx`: 제주 메인 화면과 숙소 검색 결과 표시
- `src/components/BookingModal.tsx`: 숙소 상세·예약 입력 화면
- `src/hooks/useStays.ts`: Spring 숙소 조회, 지역/종류/키워드 검색 상태
- `src/hooks/useHeroSlider.ts`: 10초 간격 메인 이미지 전환
- `src/hooks/useReservation.ts`: 예약 폼 상태와 접수 처리
- `src/types/stay.ts`: 숙소·예약 요청·응답 타입
- `src/api/stays.ts`: Spring API 통신
- `src/data/stays.ts`: API 미연결 시 표시하는 예시 데이터와 필터 값
