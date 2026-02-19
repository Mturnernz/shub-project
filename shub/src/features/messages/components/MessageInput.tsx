import React, { useState, useRef } from 'react';
import { Send, AlertTriangle, Shield, Check } from 'lucide-react';
import { moderateContent } from '../../safety/services/content-moderation';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<{ success: boolean; filtered?: boolean; error?: string }>;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...'
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewWarning, setPreviewWarning] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMessageChange = (value: string) => {
    setMessage(value);

    // Real-time content filtering preview with enhanced moderation
    if (value.trim()) {
      const result = moderateContent(value, 'message');
      if (!result.safe || result.auto_block) {
        setPreviewWarning(result.violations.map(v => v.phrase));
      } else {
        setPreviewWarning([]);
      }
    } else {
      setPreviewWarning([]);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setIsLoading(true);

    try {
      const result = await onSendMessage(trimmedMessage);

      if (result.success) {
        setMessage('');
        setPreviewWarning([]);
        setSent(true);
        setTimeout(() => setSent(false), 2000);

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }

        if (result.filtered) {
          // Show brief notification that content was filtered
          console.log('Message was filtered for safety');
        }
      } else {
        console.error('Failed to send message:', result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white/70 backdrop-blur-sm p-4">
      {/* Safety warning */}
      {previewWarning.length > 0 && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Content Safety Warning
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Your message contains terms that may be filtered: {previewWarning.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Character count */}
          <div className="flex items-center justify-between mt-1 px-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>Messages are monitored for safety</span>
            </div>
            <span className="text-xs text-gray-500">
              {message.length}/1000
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className={`p-3 text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${sent ? 'bg-safe-600 hover:bg-safe-700' : 'bg-trust-600 hover:bg-trust-700'}`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : sent ? (
            <Check className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Safety reminder */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Keep conversations respectful and follow our safety guidelines
      </div>
    </div>
  );
};

export default MessageInput;