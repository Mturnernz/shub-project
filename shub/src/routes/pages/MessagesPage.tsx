import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, User, Calendar } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { getUserConversations, type Conversation } from '../../features/messages/services/messages';
import { useMessagesStore } from '../../features/messages/stores/messages.store';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { setUnreadCounts } = useMessagesStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile?.id) return;

    const load = async () => {
      setLoading(true);
      const { data, error: fetchError } = await getUserConversations(userProfile.id);
      if (fetchError) {
        setError('Failed to load conversations');
      } else {
        setConversations(data || []);
        // Sync unread counts to global store
        const counts: Record<string, number> = {};
        (data || []).forEach((c) => {
          if (c.unread_count > 0) counts[c.booking_id] = c.unread_count;
        });
        setUnreadCounts(counts);
      }
      setLoading(false);
    };

    load();
  }, [userProfile?.id, setUnreadCounts]);

  if (!userProfile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">Please log in to view your messages.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-trust-500" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-600 text-sm mb-4">
          Messages will appear here once you have a confirmed booking.
        </p>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
        >
          View Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-2">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.booking_id}
          conversation={conv}
          currentUserId={userProfile.id}
          onClick={() => navigate(`/bookings/${conv.booking_id}/chat`, { state: { conversationBooking: conv } })}
        />
      ))}
    </div>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, currentUserId, onClick }) => {
  const { other_user, last_message, unread_count, booking } = conversation;
  const displayName = other_user?.display_name || 'User';

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-NZ', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
  };

  const lastMessagePreview = last_message
    ? last_message.sender_id === currentUserId
      ? `You: ${last_message.content}`
      : last_message.content
    : 'No messages yet';

  const statusBadge = () => {
    if (booking?.status === 'pending') {
      return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>;
    }
    if (booking?.status === 'completed') {
      return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Completed</span>;
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white/70 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-trust-100 flex items-center justify-center">
            <User className="w-6 h-6 text-trust-600" />
          </div>
          {unread_count > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unread_count > 9 ? '9+' : unread_count}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`font-semibold text-gray-900 truncate ${unread_count > 0 ? 'text-trust-700' : ''}`}>
              {displayName}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {statusBadge()}
              {last_message && (
                <span className="text-xs text-gray-500">
                  {formatTime(last_message.created_at)}
                </span>
              )}
            </div>
          </div>
          <p className={`text-sm truncate ${unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            {lastMessagePreview}
          </p>
          {booking?.start_time && (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(booking.start_time).toLocaleDateString('en-NZ', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default MessagesPage;
