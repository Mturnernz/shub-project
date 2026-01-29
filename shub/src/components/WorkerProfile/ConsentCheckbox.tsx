import React from 'react';
import { Shield, Check } from 'lucide-react';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  required = true
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-medium text-gray-900">Safety Requirements</h3>
        {required && <span className="text-red-500">*</span>}
      </div>

      {/* Safety Policy */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-medium text-red-900 mb-3">Mandatory Safe Sex Policy</h4>
        <div className="space-y-2 text-sm text-red-800">
          <p>
            <strong>All interactions must follow safe sex practices:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Condom use is mandatory for all sexual services</li>
            <li>No unsafe practices will be advertised or provided</li>
            <li>This policy protects both workers and clients</li>
            <li>Violation may result in immediate account suspension</li>
          </ul>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div
        className={`
          flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors
          ${checked
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className={`
            flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
            ${checked
              ? 'border-green-600 bg-green-600'
              : 'border-gray-400'
            }
          `}
        >
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>

        <div className="flex-1">
          <label
            className={`
              font-medium cursor-pointer
              ${checked ? 'text-green-900' : 'text-gray-900'}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          >
            I agree to the mandatory safe sex policy
          </label>
          <p className="text-sm text-gray-600 mt-1">
            I understand and commit to providing only safe services with mandatory condom use.
            I will not advertise or engage in any unsafe sexual practices.
          </p>
        </div>
      </div>

      {/* Additional Safety Information */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Additional Safety Resources</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Free STI testing available at local health clinics</p>
          <p>• Safety tips and resources available in our Help Center</p>
          <p>• Report any unsafe requests immediately</p>
          <p>• Block clients who request unsafe services</p>
        </div>
      </div>

      {/* Legal Compliance */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Legal Notice:</strong> This platform operates under New Zealand's
          Prostitution Reform Act 2003. All services must comply with health and safety
          requirements including safe sex practices.
        </p>
      </div>

      {/* Validation Message */}
      {required && !checked && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Required:</strong> You must agree to the safe sex policy before your profile can be published.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsentCheckbox;