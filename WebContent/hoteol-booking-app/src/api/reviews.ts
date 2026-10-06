import axios from 'axios';

export interface ReviewItem {
    reviewId: number;
    contentId: string;
    stayTitle: string;
    roomTitle: string;
    authorName: string;
    rating: number;
    content: string;
    createdAt: string;
    hostReply?: string | null;
    repliedAt?: string | null;
}

export async function fetchStayReviews(contentId: string): Promise<ReviewItem[]> {
    const res = await axios.get<ReviewItem[]>(`/api/v1/reviews/stays/${contentId}`);
    return res.data;
}

export async function createStayReview(payload: { reservationId: number; rating: number; content: string }) {
    const token = localStorage.getItem('accessToken');
    const res = await axios.post('/api/v1/reviews', payload, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function fetchHostReviews(): Promise<ReviewItem[]> {
    const token = localStorage.getItem('accessToken');
    const res = await axios.get<ReviewItem[]>('/api/v1/reviews/host', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function saveReviewReply(reviewId: number, reply: string) {
    const token = localStorage.getItem('accessToken');
    const res = await axios.post(`/api/v1/reviews/${reviewId}/reply`, { reply }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function deleteReviewReply(reviewId: number) {
    const token = localStorage.getItem('accessToken');
    const res = await axios.delete(`/api/v1/reviews/${reviewId}/reply`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}