import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { moderateContent } from '../../safety/services/content-moderation';

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  body: string | null;
  worker_response: string | null;
  created_at: string;
  is_visible: boolean;
  reviewer_name?: string;
}

export function useReviews(workerId: string | null) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(name)')
      .eq('reviewee_id', workerId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data || []).map((r: any) => ({
          ...r,
          reviewer_name: r.reviewer?.name,
        }));
        setReviews(mapped);
        if (mapped.length > 0) {
          const avg = mapped.reduce((sum: number, r: Review) => sum + r.rating, 0) / mapped.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
        setLoading(false);
      });
  }, [workerId]);

  const submitReview = useCallback(async (
    bookingId: string,
    reviewerId: string,
    revieweeId: string,
    rating: number,
    body: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Content moderation
    if (body.trim()) {
      const mod = moderateContent(body, 'message');
      if (mod.auto_block) {
        return { success: false, error: 'Your review contains content that cannot be submitted.' };
      }
    }

    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      body: body.trim() || null,
    });

    if (error) {
      if (error.code === '23505') return { success: false, error: 'You have already reviewed this booking.' };
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const addWorkerResponse = useCallback(async (
    reviewId: string,
    response: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase
      .from('reviews')
      .update({ worker_response: response.trim() })
      .eq('id', reviewId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  return { reviews, loading, avgRating, submitReview, addWorkerResponse };
}

export function useBookingReviewStatus(bookingId: string | null, reviewerId: string | null) {
  const [hasReview, setHasReview] = useState<boolean | null>(null);

  useEffect(() => {
    if (!bookingId || !reviewerId) return;
    supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('reviewer_id', reviewerId)
      .maybeSingle()
      .then(({ data }) => setHasReview(!!data));
  }, [bookingId, reviewerId]);

  return { hasReview };
}
