import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import StarRating from './StarRating';
import type { Review } from '../hooks/useReviews';

interface ReviewListProps {
  reviews: Review[];
  avgRating: number;
  workerId?: string;
  currentUserId?: string;
  onAddResponse?: (reviewId: string, response: string) => Promise<{ success: boolean; error?: string }>;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  avgRating,
  workerId,
  currentUserId,
  onAddResponse,
}) => {
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  if (reviews.length === 0) return null;

  const displayed = reviews.slice(0, 5);
  const isWorker = currentUserId === workerId;

  const toggleExpand = (id: string) =>
    setExpandedReviews(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const handleRespond = async (reviewId: string) => {
    const text = responseText[reviewId]?.trim();
    if (!text || !onAddResponse) return;
    setRespondingTo(reviewId);
    await onAddResponse(reviewId, text);
    setRespondingTo(null);
    setResponseText(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-trust-50 rounded-2xl">
        <div className="text-center">
          <p className="text-4xl font-bold text-trust-700 font-display">{avgRating.toFixed(1)}</p>
        </div>
        <div>
          <StarRating rating={avgRating} size="md" />
          <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {displayed.map((review) => {
          const isExpanded = expandedReviews.includes(review.id);
          const date = new Date(review.created_at).toLocaleDateString('en-NZ', {
            month: 'short', year: 'numeric'
          });

          return (
            <div key={review.id} className="bg-white/70 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <StarRating rating={review.rating} size="sm" />
                  <p className="text-xs text-gray-500 mt-0.5">{review.reviewer_name?.split(' ')[0] || 'Client'} · {date}</p>
                </div>
              </div>

              {review.body && (
                <p className={`text-sm text-gray-700 ${!isExpanded && review.body.length > 120 ? 'line-clamp-3' : ''}`}>
                  {review.body}
                </p>
              )}
              {review.body && review.body.length > 120 && (
                <button
                  onClick={() => toggleExpand(review.id)}
                  className="text-xs text-trust-600 hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}

              {/* Worker response */}
              {review.worker_response && (
                <div className="ml-4 pl-3 border-l-2 border-trust-200">
                  <p className="text-xs font-medium text-trust-700 mb-0.5">Provider response</p>
                  <p className="text-xs text-gray-600">{review.worker_response}</p>
                </div>
              )}

              {/* Add response (worker only, no existing response) */}
              {isWorker && !review.worker_response && onAddResponse && (
                <div className="space-y-2 pt-1">
                  <textarea
                    value={responseText[review.id] || ''}
                    onChange={(e) => setResponseText(prev => ({ ...prev, [review.id]: e.target.value }))}
                    placeholder="Add your response..."
                    rows={2}
                    maxLength={300}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-trust-400 resize-none"
                  />
                  <button
                    onClick={() => handleRespond(review.id)}
                    disabled={!responseText[review.id]?.trim() || respondingTo === review.id}
                    className="flex items-center gap-1 text-xs text-trust-600 font-medium hover:text-trust-700 disabled:opacity-50"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {respondingTo === review.id ? 'Saving...' : 'Post response'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewList;
