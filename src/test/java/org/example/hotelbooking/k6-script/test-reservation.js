import http from 'k6/http';
import { check } from 'k6';

export const options = {
    // 💡 100명의 유저가 동시에 5초 동안 예약을 미친듯이 누르는 '수강신청/티켓팅' 상황 시뮬레이션
    vus: 100,
    duration: '5s',
};

export default function () {
    const url = 'http://localhost:8080/api/v1/reservations';

    const payload = JSON.stringify({
        roomId: 922, // 💡 실제 존재하는 객실 ID로 변경
        checkInDate: '2026-11-01', // 💡 테스트할 날짜
        checkOutDate: '2026-11-02',
        totalPrice: 294800
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            // 💡 프론트엔드에서 복사한 토큰을 아래에 붙여넣으세요! (Bearer 포함)
            //'Authorization': 'Bearer (your access token)'
        },
    };

    const res = http.post(url, payload, params);

    // 예약 성공(200 OK) 여부만 체크
    check(res, {
        'Reservation Success (200)': (r) => r.status === 200,
    });
}
// 터미널 폴더안에서 명령어 실행
// k6 run test-reservation.js