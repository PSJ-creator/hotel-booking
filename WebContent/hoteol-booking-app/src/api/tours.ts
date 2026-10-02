import axios from 'axios';

export interface TourSummary {
    contentId: string;
    contentTypeId?: string;
    title: string;
    addr1?: string;
    addr2?: string;
    tel?: string;
    useTime?: string;
    restDate?: string;
    useFee?: string;
    firstImage?: string;
    mapX?: string;
    mapY?: string;
    overview?: string;
}

export interface TourImageItem {
    imageId: number;
    originImgUrl: string;
    imgName?: string;
}

export interface TourDetail extends TourSummary {
    zipcode?: string;
    openDate?: string;
    parking?: string;
    parkingFee?: string;
    images: TourImageItem[];
}

export async function fetchTours(): Promise<TourSummary[]> {
    const res = await axios.get<TourSummary[]>('/api/v1/tours');
    return res.data;
}

export async function fetchTourDetail(contentId: string): Promise<TourDetail> {
    const res = await axios.get<TourDetail>(`/api/v1/tours/${contentId}`);
    return res.data;
}

export async function toggleTourLike(contentId: string): Promise<{ liked: boolean; message: string }> {
    const token = localStorage.getItem('accessToken');
    const res = await axios.post<{ liked: boolean; message: string }>(
        `/api/v1/tours/likes/${contentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

export async function fetchMyTourWishlist(): Promise<TourSummary[]> {
    const token = localStorage.getItem('accessToken');
    const res = await axios.get<TourSummary[]>('/api/v1/tours/likes/my', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}