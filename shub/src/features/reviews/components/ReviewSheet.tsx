import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Sheet from '../../../components/ui/Sheet';
import Button from '../../../components/ui/Button';
import StarRating from './StarRating';
import { useReviews } from '../hooks/useReviews';

interface ReviewSheetProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  workerName: string;
}

const ReviewSheet: React.FC<ReviewSheetProps> = ({
  open,
  onClose,
  bookingId,
  reviewerId,
  revieweeId,
  workerName,
}) => {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { submitReview } = useReviews(null);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (body.trim() && body.trim().length < 10) { setError('Review must be at least 10 characters.'); return; }
    setSubmitting(true);
    setError(null);
    const result = await submitReview(bookingId, reviewerId, revieweeId, rating, body);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || 'Failed to submit review.');
    }
  };

  const handleClose = () => {
    setRating(0);
    setBody('');
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title={submitted ? undefined : `Review ${workerName}`}>
      {submitted ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-safe-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-safe-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h3>
          <p className="text-gray-500 text-sm mb-6">Your review has been submitted.</p>
          <Button className="w-full" onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-600 mb-3">How would you rate your experience with {workerName}?</p>
            <div className="flex justify-center">
              <StarRating rating={rating} size="lg" interactive onChange={setRating} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your review <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-trust-500 focus:border-transparent resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/500</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button className="flex-1" loading={submitting} onClick={handleSubmit}>
              Submit Review
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
};

export default ReviewSheet;
