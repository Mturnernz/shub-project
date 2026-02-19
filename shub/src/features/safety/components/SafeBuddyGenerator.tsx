import React, { useState } from 'react';
import { Shield, Plus, X, Copy, Check, MapPin, Clock, User, Phone, Mail } from 'lucide-react';
import { showToast } from '../../../utils/toast';
import { generateSafeBuddyLink, type SafetyInfo, type SafetyContact } from '../services/safe-buddy';
import type { BookingWithProfiles } from '../../bookings/services/bookings';

interface SafeBuddyGeneratorProps {
  booking: BookingWithProfiles;
  onClose: () => void;
  onLinkGenerated: (link: string) => void;
}

const SafeBuddyGenerator: React.FC<SafeBuddyGeneratorProps> = ({
  booking,
  onClose,
  onLinkGenerated
}) => {
  const [step, setStep] = useState<'info' | 'contacts' | 'generated'>('info');
  const [location, setLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [contacts, setContacts] = useState<SafetyContact[]>([]);
  const [newContact, setNewContact] = useState<Partial<SafetyContact>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isWorker = booking.worker_id === booking.worker_id; // This would need proper user context
  const duration = Math.ceil((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60));

  const handleAddContact = () => {
    if (!newContact.name || !newContact.relationship) return;

    const contact: SafetyContact = {
      name: newContact.name,
      relationship: newContact.relationship,
      phone: newContact.phone,
      email: newContact.email,
      notify_if_overdue: newContact.notify_if_overdue || false
    };

    setContacts([...contacts, contact]);
    setNewContact({});
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleGenerateLink = async () => {
    if (!location.trim()) {
      setError('Please provide a location');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const safetyInfo: SafetyInfo = {
        worker_name: booking.worker_profile?.user_id || 'Worker',
        client_name: booking.client_profile?.display_name || 'Client',
        location: location.trim(),
        scheduled_time: booking.start_time,
        duration_hours: duration,
        check_in_required: true,
        emergency_contact: emergencyContact.trim() || undefined
      };

      const result = await generateSafeBuddyLink(booking.id, safetyInfo, contacts);

      if (result.success && result.link) {
        setGeneratedLink(result.link);
        setStep('generated');
        onLinkGenerated(result.link);
      } else {
        setError(result.error || 'Failed to generate safety link');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate safety link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast.success('Link copied!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      showToast.error('Failed to copy link');
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-NZ', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-safe-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-safe-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Safe Buddy Link</h2>
              <p className="text-sm text-gray-600">Generate safety coordination link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isGenerating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Booking Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{formatDateTime(booking.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>Duration: {duration} hour{duration !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 'info' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Safety Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., 123 Queen Street, Auckland CBD"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safe-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Provide the specific address or general area for safety contacts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g., Police, Security, Building Management"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safe-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('contacts')}
                className="flex-1 px-4 py-2 bg-safe-600 text-white rounded-lg hover:bg-safe-700 transition-colors"
                disabled={!location.trim()}
              >
                Next: Add Contacts
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Safety Contacts */}
        {step === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Safety Contacts</h3>
              <button
                onClick={() => setStep('info')}
                className="text-sm text-safe-600 hover:text-safe-700"
              >
                ← Back
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Add trusted contacts who should be notified if you don't check in on time.
            </p>

            {/* Existing Contacts */}
            {contacts.length > 0 && (
              <div className="space-y-2">
                {contacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.relationship}</div>
                      {contact.phone && (
                        <div className="text-xs text-gray-500">{contact.phone}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveContact(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Contact */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Add Safety Contact</h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContact.name || ''}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safe-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={newContact.relationship || ''}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safe-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={newContact.phone || ''}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safe-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={newContact.email || ''}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safe-500 focus:border-transparent"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <input
                  type="checkbox"
                  checked={newContact.notify_if_overdue || false}
                  onChange={(e) => setNewContact({ ...newContact, notify_if_overdue: e.target.checked })}
                  className="rounded border-gray-300 text-safe-600 focus:ring-safe-500"
                />
                Notify if overdue
              </label>

              <button
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.relationship}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('info')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGenerateLink}
                className="flex-1 px-4 py-2 bg-safe-600 text-white rounded-lg hover:bg-safe-700 transition-colors disabled:opacity-50"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Safety Link'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generated Link */}
        {step === 'generated' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-safe-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-safe-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety Link Generated</h3>
              <p className="text-gray-600">
                Share this link with your safety contacts. They can use it to check on your wellbeing.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-safe-600 text-white rounded-lg hover:bg-safe-700 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                This link expires 24 hours after your scheduled meeting time.
              </p>
            </div>

            <div className="p-4 bg-trust-50 border border-trust-200 rounded-lg text-left">
              <h4 className="font-medium text-trust-900 mb-2">How it works:</h4>
              <ul className="text-sm text-trust-800 space-y-1">
                <li>• Share this link with trusted contacts before your meeting</li>
                <li>• Use the link to check in when your meeting is complete</li>
                <li>• If you don't check in on time, your contacts will be notified</li>
                <li>• The link includes emergency check-in options if needed</li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-safe-600 text-white rounded-lg hover:bg-safe-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeBuddyGenerator;