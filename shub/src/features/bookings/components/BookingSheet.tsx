import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, CheckCircle, DollarSign, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sheet from '../../../components/ui/Sheet';
import Button from '../../../components/ui/Button';
import type { BookingRequest } from '../services/bookings';

type Step = 'date' | 'time' | 'message' | 'summary' | 'success';

interface BookingSheetProps {
  open: boolean;
  onClose: () => void;
  workerId: string;
  clientId: string;
  workerName?: string;
  onSubmit: (request: BookingRequest) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

const BookingSheet: React.FC<BookingSheetProps> = ({
  open,
  onClose,
  workerId,
  clientId,
  workerName,
  onSubmit,
  isLoading = false,
}) => {
  const [step, setStep] = useState<Step>('date');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setStep('date');
    setStartDate('');
    setStartTime('');
    setEndTime('');
    setMessage('');
    setError(null);
    onClose();
  };

  const formatDuration = () => {
    if (!startTime || !endTime) return '';
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) return '';
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const validateDate = () => {
    if (!startDate) { setError('Please select a date'); return false; }
    setError(null);
    return true;
  };

  const validateTime = () => {
    if (!startTime || !endTime) { setError('Please set both start and end times'); return false; }
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${startDate}T${endTime}`);
    if (start <= new Date()) { setError('Booking must be at least 2 hours from now'); return false; }
    if (end <= start) { setError('End time must be after start time'); return false; }
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours < 1) { setError('Minimum 1 hour booking'); return false; }
    if (hours > 8) { setError('Maximum 8 hour booking'); return false; }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    const request: BookingRequest = {
      worker_id: workerId,
      client_id: clientId,
      start_time: new Date(`${startDate}T${startTime}`).toISOString(),
      end_time: new Date(`${startDate}T${endTime}`).toISOString(),
      message: message.trim() || undefined,
    };
    const result = await onSubmit(request);
    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || 'Failed to send request');
    }
  };

  const stepTitles: Record<Step, string> = {
    date: 'Choose a Date',
    time: 'Select Times',
    message: 'Add a Note',
    summary: 'Confirm Booking',
    success: '',
  };

  return (
    <Sheet open={open} onClose={step !== 'success' ? handleClose : undefined} title={step !== 'success' ? stepTitles[step] : undefined}>
      {/* Progress indicator */}
      {step !== 'success' && (
        <div className="flex gap-1.5 mb-6">
          {(['date', 'time', 'message', 'summary'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ['date', 'time', 'message', 'summary'].indexOf(step) >= i
                  ? 'bg-trust-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Date */}
      {step === 'date' && (
        <div className="space-y-4">
          {workerName && (
            <p className="text-sm text-gray-600">Booking with <span className="font-semibold text-gray-900">{workerName}</span></p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5" />
              Select Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-trust-500 focus:border-transparent text-base"
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => { if (validateDate()) setStep('time'); }}
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Step 2: Time */}
      {step === 'time' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{formatDate(startDate)}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1.5" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-trust-500 focus:border-transparent text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-trust-500 focus:border-transparent text-base"
              />
            </div>
          </div>
          {formatDuration() && (
            <div className="p-3 bg-trust-50 rounded-lg text-sm text-trust-700">
              Duration: <strong>{formatDuration()}</strong>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('date')}>Back</Button>
            <Button className="flex-1" onClick={() => { if (validateTime()) setStep('message'); }}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Message */}
      {step === 'message' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Optional — share any specific requests or questions.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1.5" />
              Note to {workerName || 'provider'} (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any notes or special requests..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-trust-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('time')}>Back</Button>
            <Button className="flex-1" onClick={() => setStep('summary')}>
              Review <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 'summary' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">
            {workerName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Provider</span>
                <span className="font-medium">{workerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="font-medium">{startTime} – {endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium">{formatDuration()}</span>
            </div>
            {message && (
              <div>
                <span className="text-gray-500 block mb-1">Note</span>
                <p className="text-gray-700 bg-white rounded-lg p-2 text-xs">{message}</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-trust-50 border border-trust-200 rounded-xl text-xs text-trust-800">
            <DollarSign className="w-3.5 h-3.5 inline mr-1" />
            Payment is arranged directly with the provider after booking is confirmed.
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('message')}>Back</Button>
            <Button className="flex-1" loading={isLoading} onClick={handleSubmit}>
              Send Request
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 'success' && (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-safe-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-safe-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Sent!</h3>
          <p className="text-gray-600 mb-1">
            {workerName
              ? <>Your request has been sent to <strong>{workerName}</strong>.</>
              : 'Your booking request has been sent.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">You'll be notified once they respond.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>Close</Button>
            <Button className="flex-1" onClick={() => { handleClose(); navigate('/bookings'); }}>
              View Bookings
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
};

export default BookingSheet;
