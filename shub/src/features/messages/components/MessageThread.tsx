import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Clock, User, Flag } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import {
  getMessagesByBooking,
  sendMessage,
  markMessagesAsRead,
  type MessageWithSender,
  type Message,
} from '../services/messages';
import { useMessageRealtime } from '../hooks/useMessageRealtime';
import type { BookingWithProfiles } from '../../bookings/services/bookings';
import ReportModal from '../../safety/components/ReportModal';

interface MessageThreadProps {
  booking: BookingWithProfiles;
  currentUserId: string;
  onBack: () => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  booking,
  currentUserId,
  onBack
}) => {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWorker = booking.worker_id === currentUserId;
  const otherUser = isWorker ? 'Client' : 'Worker';

  // Real-time message subscription
  useMessageRealtime(booking.id, currentUserId, {
    onMessageReceived: (message: Message) => {
      setMessages(prev => {
        // Avoid duplicates (in case of race with optimistic update)
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, { ...message, sender: { display_name: otherUser } }];
      });
    },
    onMessageDeleted: (messageId: string) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    },
  });

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: messageError } = await getMessagesByBooking(booking.id);

        if (messageError) {
          throw messageError;
        }

        setMessages(data || []);

        // Mark messages as read
        await markMessagesAsRead(booking.id, currentUserId);
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [booking.id, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    try {
      const { data, error, filtered } = await sendMessage(booking.id, currentUserId, content);

      if (error) {
        throw error;
      }

      if (data) {
        // Add message to local state immediately for better UX
        const newMessage: MessageWithSender = {
          ...data,
          sender: {
            display_name: 'You'
          }
        };

        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();

        return { success: true, filtered };
      }

      return { success: false, error: 'Failed to send message' };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message || 'Failed to send message' };
    }
  };

  const formatBookingTime = () => {
    const startDate = new Date(booking.start_time);
    const endDate = new Date(booking.end_time);

    return {
      date: startDate.toLocaleDateString('en-NZ', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
      time: `${startDate.toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })} - ${endDate.toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`
    };
  };

  const bookingTime = formatBookingTime();

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white/70 backdrop-blur-sm">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>

        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white/70 backdrop-blur-sm">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">Error</h2>
          </div>
        </div>

        {/* Error state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-trust-600 text-white rounded-lg hover:bg-trust-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white/70 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-trust-100 flex items-center justify-center">
            <User className="w-5 h-5 text-trust-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{otherUser}</h2>
            <p className="text-sm text-gray-600">Booking conversation</p>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Report user"
        >
          <Flag className="w-5 h-5" />
        </button>
      </div>

      {/* Booking Info */}
      <div className="p-4 bg-trust-50 border-b border-trust-100">
        <div className="flex items-center gap-4 text-sm text-trust-700">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{bookingTime.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{bookingTime.time}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-trust-50/50 to-warm-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-trust-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-600 text-sm">
              Send a message to coordinate your booking safely
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={booking.status === 'cancelled' || booking.status === 'completed'}
        placeholder={
          booking.status === 'cancelled'
            ? 'This booking has been cancelled'
            : booking.status === 'completed'
            ? 'This booking has been completed'
            : 'Type your message...'
        }
      />

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType="user"
          targetId={isWorker ? booking.client_id : booking.worker_id}
          targetName={isWorker ? booking.client_profile?.display_name : booking.worker_profile?.user_id}
          onClose={() => setShowReportModal(false)}
          onReportSubmitted={() => {
            setShowReportModal(false);
            // Could show success message
          }}
          reporterId={currentUserId}
        />
      )}
    </div>
  );
};

export default MessageThread;