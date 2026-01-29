import React, { useState } from 'react';
import { Clock, MessageCircle } from 'lucide-react';

interface AvailabilitySetterProps {
  status: 'available' | 'busy' | 'away';
  statusMessage?: string;
  onStatusUpdate: (status: 'available' | 'busy' | 'away', message?: string) => void;
}

const AvailabilitySetter: React.FC<AvailabilitySetterProps> = ({
  status,
  statusMessage,
  onStatusUpdate,
}) => {
  const [localStatus, setLocalStatus] = useState(status);
  const [localMessage, setLocalMessage] = useState(statusMessage || '');
  const [isSaving, setSaving] = useState(false);

  const statusOptions = [
    {
      value: 'available' as const,
      label: 'Available',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      description: 'Ready to accept new bookings',
      icon: '🟢',
    },
    {
      value: 'busy' as const,
      label: 'Busy',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      description: 'Currently unavailable',
      icon: '🟡',
    },
    {
      value: 'away' as const,
      label: 'Away',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      description: 'Taking a break',
      icon: '🔴',
    },
  ];

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'away') => {
    setLocalStatus(newStatus);
    setSaving(true);
    
    try {
      await onStatusUpdate(newStatus, localMessage);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMessage(e.target.value);
  };

  const handleMessageSave = async () => {
    setSaving(true);
    try {
      await onStatusUpdate(localStatus, localMessage);
    } catch (error) {
      console.error('Error updating status message:', error);
    } finally {
      setSaving(false);
    }
  };

  const currentStatusOption = statusOptions.find(option => option.value === localStatus)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Availability Status</h3>
        {isSaving && (
          <span className="text-sm text-blue-600">Saving...</span>
        )}
      </div>

      {/* Current Status Display */}
      <div className={`p-4 rounded-xl border-2 ${currentStatusOption.bgColor} ${currentStatusOption.borderColor}`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{currentStatusOption.icon}</span>
          <div>
            <h4 className={`font-medium ${currentStatusOption.color}`}>
              Currently {currentStatusOption.label}
            </h4>
            <p className="text-sm text-gray-600">{currentStatusOption.description}</p>
            {localMessage && (
              <p className="text-sm text-gray-700 mt-1 italic">"{localMessage}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Options */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Change Status
        </h4>
        
        <div className="grid gap-3">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={isSaving}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                localStatus === option.value
                  ? `${option.bgColor} ${option.borderColor}`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{option.icon}</span>
                <div>
                  <div className={`font-medium ${
                    localStatus === option.value ? option.color : 'text-gray-700'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Message */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 flex items-center">
          <MessageCircle className="w-4 h-4 mr-2" />
          Custom Status Message
        </h4>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={localMessage}
            onChange={handleMessageChange}
            placeholder="Add a custom message (optional)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={100}
          />
          <button
            onClick={handleMessageSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
          >
            Save
          </button>
        </div>
        
        <p className="text-xs text-gray-500">
          {localMessage.length}/100 characters
        </p>
      </div>

      {/* Status Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Status Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Available:</strong> Use when you're ready to accept new bookings</li>
          <li>• <strong>Busy:</strong> Use during active bookings or when temporarily unavailable</li>
          <li>• <strong>Away:</strong> Use when taking extended breaks or holidays</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilitySetter;