// 나중에 regoins(지역), tyeps

import type { Stay } from '../types/stay';

export const regions=['전체 지역','제주시','애월·한림','함덕·월정','서귀포·중문','성산·표선'];
export const types=['전체 숙박','호텔·리조트','펜션·풀빌라','게스트하우스'];
export const sample:Stay[]=[
 {id:1,name:'바다곁 제주 스테이',region:'애월·한림',type:'펜션·풀빌라',addressSido:'제주특별자치도',address:'제주시 애월읍',basePrice:129000,thumbnailUrl:'/jeju-stays.png',imageUrls:['/jeju-stays.png'],description:'바다를 가까이에서 만나는 조용한 애월의 하루',nearby:'애월 해안도로'},
 {id:2,name:'오름빛 리조트',region:'서귀포·중문',type:'호텔·리조트',addressSido:'제주특별자치도',address:'서귀포시 중문동',basePrice:189000,thumbnailUrl:'/jeju-stays.png',imageUrls:['/jeju-stays.png'],description:'제주의 푸른 풍경을 담은 편안한 휴식',nearby:'중문 관광단지'},
 {id:3,name:'월정의 오후',region:'함덕·월정',type:'게스트하우스',addressSido:'제주특별자치도',address:'제주시 구좌읍',basePrice:68000,thumbnailUrl:'/jeju-stays.png',imageUrls:['/jeju-stays.png'],description:'해변 산책으로 시작하는 가벼운 제주 여행',nearby:'월정리 해변'},
 {id:4,name:'성산 바람의 집',region:'성산·표선',type:'펜션·풀빌라',addressSido:'제주특별자치도',address:'서귀포시 성산읍',basePrice:115000,thumbnailUrl:'/jeju-stays.png',imageUrls:['/jeju-stays.png'],description:'동쪽 바다와 일출을 곁에 둔 아늑한 공간',nearby:'성산일출봉'},
 {id:5,name:'탐라 시티 호텔',region:'제주시',type:'호텔·리조트',addressSido:'제주특별자치도',address:'제주시 연동',basePrice:99000,thumbnailUrl:'/jeju-stays.png',imageUrls:['/jeju-stays.png'],description:'제주 여행의 시작과 끝을 편안하게',nearby:'제주공항'},
 {id:6,name:'협재 느린집',region:'애월·한림',type:'게스트하우스',addressSido:'제주특별자치도',address:'제주시 한림읍',basePrice:75000,thumbnailUrl:'/jeju-stays.png',imageUrls:['/jeju-stays.png'],description:'협재의 하얀 모래와 푸른 바다를 따라',nearby:'협재해수욕장'}
];
export const destinations=[{name:'애월·한림',note:'해안도로와 석양',className:'spot-a'},{name:'서귀포·중문',note:'폭포와 남쪽 바다',className:'spot-b'},{name:'성산·표선',note:'일출과 오름',className:'spot-c'}];
export const money=(n:number)=>new Intl.NumberFormat('ko-KR').format(n)+'원';
