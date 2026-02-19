import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { showToast } from '../../../utils/toast';

const PAYMENT_OPTIONS = ['Bank Transfer', 'Cash', 'Afterpay', 'Crypto', 'PayPal', 'Other'];

interface PaymentMethodEditorProps {
  methods: string[];
  onUpdate: (methods: string[]) => Promise<void>;
}

const PaymentMethodEditor: React.FC<PaymentMethodEditorProps> = ({ methods, onUpdate }) => {
  const [selected, setSelected] = useState<string[]>(methods);
  const [saving, setSaving] = useState(false);

  const toggle = (method: string) => {
    setSelected(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(selected);
      showToast.success('Payment methods saved');
    } catch {
      showToast.error('Failed to save payment methods');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-5 h-5 text-trust-600" />
        <h3 className="text-lg font-semibold text-gray-900">Accepted Payments</h3>
      </div>
      <p className="text-sm text-gray-500">
        Select your preferred payment methods. These are shown to clients after a confirmed booking.
      </p>
      <div className="flex flex-wrap gap-2">
        {PAYMENT_OPTIONS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => toggle(method)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              selected.includes(method)
                ? 'bg-trust-600 text-white border-trust-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-trust-400'
            }`}
          >
            {method}
          </button>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 bg-trust-600 text-white rounded-xl text-sm font-medium hover:bg-trust-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default PaymentMethodEditor;
