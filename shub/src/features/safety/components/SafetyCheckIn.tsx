import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, Phone, MapPin, Timer, Heart } from 'lucide-react';
import { processSafetyCheckIn, type CheckInData } from '../services/safe-buddy';

interface SafetyCheckInProps {
  token: string;
  scheduledTime: string;
  durationHours: number;
  workerName?: string;
  onCheckInComplete?: () => void;
}

type CheckInPhase = 'pre_meeting' | 'during' | 'check_in_due' | 'overdue' | 'completed';

const SafetyCheckIn: React.FC<SafetyCheckInProps> = ({
  token,
  scheduledTime,
  durationHours,
  workerName,
  onCheckInComplete,
}) => {
  const [phase, setPhase] = useState<CheckInPhase>('pre_meeting');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<'safe' | 'need_help' | 'emergency' | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePhase = useCallback(() => {
    const now = new Date();
    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    const gracePeriodEnd = new Date(end.getTime() + 30 * 60 * 1000); // 30 min grace

    if (now < start) return 'pre_meeting';
    if (now >= start && now < end) return 'during';
    if (now >= end && now < gracePeriodEnd) return 'check_in_due';
    return 'overdue';
  }, [scheduledTime, durationHours]);

  const formatTimeRemaining = useCallback(() => {
    const now = new Date();
    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    let targetTime: Date;
    let prefix: string;

    const currentPhase = calculatePhase();

    if (currentPhase === 'pre_meeting') {
      targetTime = start;
      prefix = 'Meeting starts in';
    } else if (currentPhase === 'during') {
      targetTime = end;
      prefix = 'Check-in due in';
    } else {
      const overdueMins = Math.floor((now.getTime() - end.getTime()) / (1000 * 60));
      return `Overdue by ${overdueMins} min`;
    }

    const diff = targetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) return `${prefix} ${hours}h ${minutes}m`;
    if (minutes > 0) return `${prefix} ${minutes}m ${seconds}s`;
    return `${prefix} ${seconds}s`;
  }, [scheduledTime, durationHours, calculatePhase]);

  useEffect(() => {
    if (submitted) return;

    const interval = setInterval(() => {
      const newPhase = calculatePhase();
      setPhase(newPhase);
      setTimeRemaining(formatTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculatePhase, formatTimeRemaining, submitted]);

  const handleCheckIn = async (status: 'safe' | 'need_help' | 'emergency') => {
    setCheckInStatus(status);

    if (status === 'safe') {
      await submitCheckIn({ status: 'safe' });
    } else {
      setShowCheckInForm(true);
    }
  };

  const submitCheckIn = async (data: CheckInData) => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await processSafetyCheckIn(token, data);
      if (result.success) {
        setSubmitted(true);
        setPhase('completed');
        onCheckInComplete?.();
      } else {
        setError(result.error || 'Failed to submit check-in');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-safe-50 border border-safe-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-safe-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-safe-600" />
          </div>
          <div>
            <p className="font-semibold text-safe-800">Check-in Complete</p>
            <p className="text-sm text-safe-600">
              {checkInStatus === 'safe'
                ? 'Your safety contacts have been notified that you are safe.'
                : checkInStatus === 'need_help'
                ? 'Your contacts have been alerted. Help is on the way.'
                : 'Emergency services and contacts have been notified.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const phaseColors = {
    pre_meeting: { bg: 'bg-trust-50', border: 'border-trust-200', text: 'text-trust-800', icon: 'text-trust-600' },
    during: { bg: 'bg-trust-50', border: 'border-trust-200', text: 'text-trust-800', icon: 'text-trust-600' },
    check_in_due: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-600' },
    overdue: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' },
    completed: { bg: 'bg-safe-50', border: 'border-safe-200', text: 'text-safe-800', icon: 'text-safe-600' },
  };

  const colors = phaseColors[phase];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5 space-y-4`}>
      {/* Timer header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
            {phase === 'overdue' ? (
              <AlertTriangle className={`w-5 h-5 ${colors.icon} animate-pulse`} />
            ) : (
              <Timer className={`w-5 h-5 ${colors.icon}`} />
            )}
          </div>
          <div>
            <p className={`font-semibold ${colors.text}`}>Safety Timer</p>
            <p className={`text-sm ${colors.text} opacity-75`}>{timeRemaining}</p>
          </div>
        </div>

        {phase === 'overdue' && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold animate-pulse">
            OVERDUE
          </span>
        )}
      </div>

      {/* Phase-specific content */}
      {phase === 'pre_meeting' && (
        <div className="space-y-3">
          <p className="text-sm text-trust-700">
            Your safety timer will start when your meeting begins.
            Make sure your safety contacts have your Safe Buddy link.
          </p>
          <div className="flex items-center gap-2 text-xs text-trust-600">
            <Shield className="w-4 h-4" />
            <span>Check-in will be required after the meeting ends</span>
          </div>
        </div>
      )}

      {phase === 'during' && (
        <div className="space-y-3">
          <p className="text-sm text-trust-700">
            Meeting in progress{workerName ? ` with ${workerName}` : ''}.
            You can check in early at any time.
          </p>
          <button
            onClick={() => handleCheckIn('safe')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-safe-600 text-white rounded-xl text-sm font-semibold hover:bg-safe-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Check In Early (I'm Safe)
          </button>
        </div>
      )}

      {(phase === 'check_in_due' || phase === 'overdue') && !showCheckInForm && (
        <div className="space-y-3">
          <p className={`text-sm ${colors.text}`}>
            {phase === 'check_in_due'
              ? 'Your meeting time has ended. Please check in to let your contacts know you are safe.'
              : 'Your check-in is overdue. Your safety contacts will be notified if you don\'t check in soon.'}
          </p>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleCheckIn('safe')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-safe-600 text-white rounded-xl font-semibold hover:bg-safe-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              I'm Safe
            </button>

            <button
              onClick={() => handleCheckIn('need_help')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              <Heart className="w-5 h-5" />
              I Need Help
            </button>

            <button
              onClick={() => handleCheckIn('emergency')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Emergency
            </button>
          </div>

          {phase === 'overdue' && (
            <div className="bg-red-100 rounded-lg p-3 text-xs text-red-700">
              <p className="font-semibold">Emergency contacts:</p>
              <p>NZ Police: 111 | NZPC Helpline: 0800 762 753</p>
            </div>
          )}
        </div>
      )}

      {/* Help/Emergency form */}
      {showCheckInForm && (
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${
            checkInStatus === 'emergency' ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <p className={`text-sm font-semibold ${
              checkInStatus === 'emergency' ? 'text-red-800' : 'text-amber-800'
            }`}>
              {checkInStatus === 'emergency'
                ? 'If you are in immediate danger, call 111 now.'
                : 'Describe what help you need:'}
            </p>
          </div>

          <textarea
            value={checkInNotes}
            onChange={(e) => setCheckInNotes(e.target.value)}
            placeholder={
              checkInStatus === 'emergency'
                ? 'Briefly describe your situation (optional)...'
                : 'What kind of help do you need?'
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:ring-2 focus:ring-trust-500 focus:border-transparent"
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCheckInForm(false);
                setCheckInStatus(null);
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                submitCheckIn({
                  status: checkInStatus!,
                  notes: checkInNotes,
                })
              }
              disabled={submitting}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors ${
                checkInStatus === 'emergency'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {submitting ? 'Sending...' : 'Send Alert'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}
    </div>
  );
};

export default SafetyCheckIn;
