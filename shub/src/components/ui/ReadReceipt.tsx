import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface ReadReceiptProps {
  readAt: string | null;
  isSender: boolean;
}

/**
 * Shows ✓ (delivered) or ✓✓ blue (read) on messages sent by current user.
 */
const ReadReceipt: React.FC<ReadReceiptProps> = ({ readAt, isSender }) => {
  if (!isSender) return null;

  return readAt ? (
    <CheckCheck className="w-3.5 h-3.5 text-trust-400 flex-shrink-0" aria-label="Read" />
  ) : (
    <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" aria-label="Delivered" />
  );
};

export default ReadReceipt;
