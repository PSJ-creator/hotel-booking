import http from 'k6/http';
import { check } from 'k6';

// 테스트 옵션: 100명의 유저가 1분 동안 미친듯이 새로고침을 누릅니다.
export const options = {
    vus: 100,
    duration: '1m',
};

export default function () {
    // Before 상태: 캐시 없이 DB를 매번 찌르는 조회 API
    const res = http.get('http://localhost:8080/api/v1/stays');

    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}
// 터미널 폴더안에서 명령어 실행
// k6 run test-stay.js