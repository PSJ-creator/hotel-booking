# 🌴 제주 야호 (JEJU YA-HO) 

> **제주도 여행객을 위한 종합 숙소 예약 및 관광지 큐레이션 플랫폼**
> 
> 카카오 지도 기반의 직관적인 탐색, 토스페이먼츠를 통한 안전한 객실 결제, 그리고 AI 챗봇 가이드까지 제공하는 Full-Stack 웹 서비스입니다. 일반 사용자(게스트), 숙소 관리자(호스트), 총괄 관리자(어드민) 3개의 권한에 따른 맞춤형 기능을 제공합니다.

---

## 🚨 Security Notice (Public Repository)
본 저장소는 포트폴리오 공개용(Public) 레포지토리입니다. 
보안을 위해 **실제 운영 서버 IP, Oracle DB 접속 정보, 카카오/토스/OpenAI 등의 실제 API 키 값은 모두 제거한 상태**입니다.

---

## 🛠 Tech Stack

### Frontend
* **Core**: React 19, TypeScript, Vite
* **Routing & State**: React Router DOM
* **Map & Payment**: Kakao Maps API, Toss Payments SDK
* **Styling & UI**: 순수 CSS, Lucide React (Icons)

### Backend
* **Core**: Java 21, Spring Boot 3.x
* **Data & ORM**: Spring Data JPA, QueryDSL, Hibernate
* **Database & Cache**: Oracle Autonomous Database (Cloud), Redis (Redisson)
* **Security**: Spring Security, JWT (Access / Refresh Token)
* **AI & API**: Spring AI (OpenAI), JavaMailSender, OpenWeatherMap

### Infrastructure & CI/CD
* **Server**: Oracle Cloud Ubuntu Instance (단일 서버 배포)
* **CI/CD**: GitHub Actions (자동 빌드 및 SSH 무중단 배포)

---

## ✨ Key Features

### 👤 일반 사용자 (Guest)
* **카카오 간편 로그인 & 이메일 인증**: JWT 기반의 안전한 인증 및 이메일 쿨타임/인증번호 로직 구현.
* **숙소 & 관광지 탐색**: 카카오 지도 클러스터링을 활용한 위치 기반 검색 및 필터링.
* **실시간 예약 및 안전 결제**: Redis 분산 락(Redisson)을 활용하여 다중 접속 시 객실 예약 동시성(초과 예약) 완벽 제어. 토스페이먼츠 연동 결제.
* **AI 제주 가이드 (야호봇)**: Spring AI와 OpenAI API를 연동한 제주도 여행 코스 및 맛집 추천 챗봇.

### 🏠 숙소 관리자 (Host)
* **숙소 & 객실 관리**: 호스트 권한 신청 후 본인의 숙소 및 객실 이미지/정보/재고 등록.
* **예약 & 매출 대시보드**: 내 숙소에 접수된 예약 현황 및 누적 매출 실시간 조회.
* **리뷰 관리**: 고객이 남긴 리뷰 확인 및 사장님 답글 작성 기능.

### 👑 총괄 관리자 (Admin)
* **신규 숙소 심사**: 호스트가 등록한 신규 숙소의 승인 및 반려 처리.
* **이메일 알림 연동**: 예약 확정, 숙소 승인/반려 시 사용자에게 자동 안내 이메일(JavaMail) 발송.
* **파트너 관리**: 전체 호스트의 운영 객실 및 발생 매출 통합 모니터링.

---
## 👥 Team & Role

| 이름 | 포지션 | 담당 업무 | GitHub |
| :--- | :--- | :--- | :--- |
| **조문희**<br>(Team Leader) | **Backend Core & DB** | **[Database & Infrastructure]**<br>- Oracle Cloud (OCI) Autonomous Database 연동 및 데이터베이스 스키마(ERD) 설계<br>- Redis(Redisson) 기반 분산 락을 활용한 다중 예약 동시성 제어 및 숙소-관광지 거리 계산 최적화<br>- 숙소 데이터 벌크 삭제(Bulk Delete) 쿼리 성능 개선<br><br>**[Backend & Security]**<br>- 카카오 OAuth2 간편 로그인 및 JWT(Access/Refresh) 기반 인증 시스템 구현<br>- 이메일 인증 기반 비밀번호 재설정 로직 및 시크릿 환경 변수 관리<br>- 호스트 및 예약 관리를 위한 핵심 REST API 설계<br><br>**[AI & Payment 연동]**<br>- Spring AI를 활용한 챗봇 기능 연동<br>- 토스페이먼츠 가상결제 시스템 연동 | [munhee777](https://github.com/munhee777) |
| **박성진**<br>(FE Lead & DevOps) | **Frontend Lead & CI/CD** | **[Frontend Architecture & Core]**<br>- React·TypeScript 기반 프론트엔드 아키텍처 설계 및 UI/UX 개발 총괄<br>- 다중 조건 숙소 검색·필터링 최적화 및 숙소 상세·예약 내역·회원 계정 도메인 구축<br>- 사용자 권한(RBAC) 및 호스트 상태 기반 동적 라우팅·접근 제어 구현<br><br>**[Service & External API]**<br>- 카카오맵 API 기반 위치 시각화 및 라우팅 간 지도 상태(State) 보존 처리<br>- 실시간 제주 기상청 API 연동 및 위시리스트·리뷰 도메인 구축<br>- 관리자 실시간 알림 시스템 및 예약 확정 SMTP 이메일 발송 자동화<br><br>**[DevOps & Security]**<br>- 프로젝트 초기 개발 환경 세팅 및 Git 브랜치 전략 수립·형상 관리 총괄<br>- GitHub Actions 기반 CI/CD 자동화 배포 파이프라인 구축<br>- API 봇(Bot) 방어 정책 수립 및 민감정보(Secret) 보안 분리 | [PSJ-creator](https://github.com/PSJ-creator) |
| **공통**<br>(Common) | **Backend & Architecture** | **[Common Backend & Collaboration]**<br>- 도메인별(숙소·예약·회원·리뷰·위시리스트) Spring Boot 백엔드 비즈니스 로직 및 CRUD API 공동 개발<br>- 프론트엔드-백엔드 간 데이터 바인딩, 통합 테스트 및 예외 처리·트러블슈팅 진행 | - |

---

## 🏗 Architecture & ERD
> <img width="2400" height="1792" alt="image" src="https://github.com/user-attachments/assets/57a36a6c-73d3-4436-b362-42bf11c70f76" />

> <img width="2048" height="1489" alt="unknown" src="https://github.com/user-attachments/assets/4aabbe46-8036-416b-93a0-e48abe5641bc" />

---

## 💡 Technical Decisions & Troubleshooting

**1. 다중 접속 시 객실 예약 동시성 제어 (초과 예약 방지)**
- **문제:** 동일한 날짜의 단일 객실에 다수의 게스트가 동시에 결제를 시도할 경우, 초과 예약이 발생할 수 있는 동시성 이슈 식별.
- **해결:** DB 락(Pessimistic/Optimistic)과 Redis 기반 분산 락을 비교 검토. 숙소 예약 특성상 트래픽이 몰릴 때 DB 커넥션 점유 시간을 최소화하고 데드락을 방지하기 위해 **Redisson을 활용한 분산 락** 도입.

**2. 단일 서버 배포 환경의 한계점과 개선 방향**
- **현황:** OCI 우분투 단일 인스턴스에서 내장 톰캣으로 정적 파일과 API를 동시 서빙하며, 기존 프로세스 kill 후 재가동하는 자동화 스크립트 적용.
- **향후 계획:** 배포 시 발생하는 짧은 다운타임을 제거하기 위해 Nginx Reverse Proxy를 도입한 무중단 배포(Blue-Green) 환경으로 고도화 예정.

---

## 📁 Project Structure

```text
hotel-booking/
├── .github/workflows/
│   └── deploy.yml                      # GitHub Actions CI/CD 파이프라인 스크립트
├── src/main/java/.../hotelbooking/     # Spring Boot 백엔드 로직
│   ├── domain/                         # 도메인별 분리 (member, accommodation, reservation 등)
│   └── global/                         # 공통 설정 (Security, JWT, QueryDSL, Cache 등)
├── src/main/resources/
│   ├── application.properties          # 서버 기본 설정
│   └── application-template.properties # 🔒 백엔드 시크릿 정보 템플릿
└── WebContent/hoteol-booking-app/      # React 프론트엔드 (단일 서버 서빙)
    ├── src/
    ├── .env.template                   # 🔒 프론트엔드 환경변수 템플릿
    └── package.json
```

---

## 🚀 Getting Started (로컬 개발 환경 설정)

### 1. 백엔드 설정 (Spring Boot)
1. `src/main/resources/` 경로에 있는 `application-template.properties` 파일을 복사하여 `application-secret.properties` 파일을 생성합니다.
2. 생성한 파일 내의 `your-api-key`, `your-password` 등의 값을 발급받은 실제 키 값으로 변경합니다.
3. Oracle DB 지갑 파일을 `resources/wallet` 경로에 배치합니다.
4. Redis 서버(기본 포트 6379)를 로컬에 실행합니다.
5. `HotelBookingApplication.java`를 실행합니다. (기본 포트 8080)

### 2. 프론트엔드 설정 (React)
1. `WebContent/hoteol-booking-app/` 경로로 이동합니다.
2. `.env.template` 파일을 복사하여 `.env` 파일을 생성하고 카카오 REST API 키 등을 입력합니다.
3. 의존성을 설치하고 개발 서버를 실행합니다.
```bash
cd WebContent/hoteol-booking-app
npm install
npm run dev
```

---

## ⚙️ CI/CD & Deployment

본 프로젝트는 **단일 서버 배포(Single-Server Deployment)** 구조를 채택하여, Spring Boot가 내장 톰캣을 통해 백엔드 API와 React 정적 빌드 파일을 함께 서빙합니다.

**GitHub Actions Workflow (`deploy.yml`) 흐름:**
1. `main` 브랜치에 Push 발생 시 트리거 작동
2. JDK 21 및 Node.js 20 환경 세팅
3. GitHub Secrets에 안전하게 저장된 환경변수를 주입하여 `application-secret.properties` 및 `.env` 파일 동적 생성
4. React 빌드 (`npm run build`) 후 Spring Boot의 `static` 폴더로 산출물 복사
5. Gradle을 이용해 최종 `jar` 파일 빌드
6. SCP를 통해 빌드된 `jar` 파일을 Oracle Cloud Ubuntu 서버로 전송
7. SSH 접속 후 기존 점유 포트(8080)를 안전하게 종료(`kill`)하고, `nohup`을 이용해 새 애플리케이션 백그라운드 무중단 실행

*(자세한 트러블슈팅 및 배포 과정의 문제 해결 내역은 블로그/포트폴리오 문서를 참조하세요.)*
