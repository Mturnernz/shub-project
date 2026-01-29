import React from 'react';
import { Check, CheckCheck, AlertTriangle } from 'lucide-react';
import type { MessageWithSender } from '../../lib/messages';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  showTime?: boolean;
  isFiltered?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showTime = true,
  isFiltered = false
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-NZ', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-NZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const containsFilteredContent = message.content.includes('[FILTERED]');

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Sender name (for received messages) */}
        {!isOwn && message.sender && (
          <div className="text-xs text-gray-500 mb-1 px-3">
            {message.sender.display_name}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-2xl break-words
            ${isOwn
              ? 'bg-purple-600 text-white rounded-br-md'
              : 'bg-white/70 backdrop-blur-sm text-gray-900 rounded-bl-md border border-white/20'
            }
            ${containsFilteredContent ? 'border-yellow-300' : ''}
          `}
        >
          {/* Filtered content warning */}
          {containsFilteredContent && (
            <div className="flex items-center gap-1 mb-2 text-xs text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Message contains filtered content</span>
            </div>
          )}

          {/* Message content */}
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Time and status */}
          {showTime && (
            <div className={`
              flex items-center justify-end gap-1 mt-1 text-xs
              ${isOwn ? 'text-purple-200' : 'text-gray-500'}
            `}>
              <span>{formatTime(message.created_at)}</span>
              {isOwn && (
                <div className="flex items-center">
                  {/* Placeholder for read status - could be enhanced with actual read receipts */}
                  <CheckCheck className="w-3 h-3" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Safety notice for filtered messages */}
        {containsFilteredContent && !isOwn && (
          <div className="text-xs text-yellow-600 mt-1 px-3">
            This message was automatically filtered for safety
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;