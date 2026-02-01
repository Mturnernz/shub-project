import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle, ExternalLink, Phone } from 'lucide-react';
import {
  submitUglyMugsAlert,
  INCIDENT_TYPES,
  type UglyMugsIncidentType,
} from '../services/ugly-mugs';
import { useAuthStore } from '../../auth/stores/auth.store';

interface UglyMugsAlertProps {
  onComplete?: () => void;
  onCancel?: () => void;
  prefillBookingId?: string;
}

type AlertStep = 'type' | 'details' | 'confirm' | 'submitted';

const UglyMugsAlert: React.FC<UglyMugsAlertProps> = ({ onComplete, onCancel, prefillBookingId }) => {
  const { userProfile } = useAuthStore();
  const [step, setStep] = useState<AlertStep>('type');

  // Form state
  const [incidentType, setIncidentType] = useState<UglyMugsIncidentType | null>(null);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationArea, setLocationArea] = useState('');
  const [description, setDescription] = useState('');
  const [clientDescription, setClientDescription] = useState('');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [policeReportFiled, setPoliceReportFiled] = useState(false);
  const [policeReportNumber, setPoliceReportNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedType = INCIDENT_TYPES.find((t) => t.value === incidentType);

  const handleSubmit = async () => {
    if (!userProfile || !incidentType || !description.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await submitUglyMugsAlert(userProfile.id, {
      client_description: clientDescription,
      incident_type: incidentType,
      severity: selectedType?.severity || 'warning',
      incident_date: incidentDate,
      location_area: locationArea,
      description: description.trim(),
      physical_description: physicalDescription || undefined,
      vehicle_description: vehicleDescription || undefined,
      contact_method: contactMethod || undefined,
      police_report_filed: policeReportFiled,
      police_report_number: policeReportNumber || undefined,
    });

    if (result.success) {
      setStep('submitted');
    } else {
      setError(result.error || 'Failed to submit alert');
    }

    setSubmitting(false);
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Report a Bad Client</h2>
        <p className="text-sm text-gray-600 mt-1">
          Your report will be shared anonymously with other providers in your area.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        <p className="font-semibold mb-1">If you are in immediate danger:</p>
        <p>Call NZ Police: <strong>111</strong> | NZPC Helpline: <strong>0800 762 753</strong></p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">What happened?</p>
        {INCIDENT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setIncidentType(type.value)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
              incidentType === type.value
                ? type.severity === 'critical'
                  ? 'bg-red-100 border-2 border-red-400 text-red-800'
                  : type.severity === 'danger'
                  ? 'bg-amber-100 border-2 border-amber-400 text-amber-800'
                  : 'bg-trust-100 border-2 border-trust-400 text-trust-800'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-medium">{type.label}</span>
            {type.severity === 'critical' && (
              <span className="px-2 py-0.5 bg-red-200 text-red-700 rounded text-xs font-semibold">Critical</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('details')}
          disabled={!incidentType}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Incident Details</h2>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">When did this happen?</label>
        <input
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-trust-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Area / Suburb <span className="text-xs text-gray-400">(general area only, not exact address)</span>
        </label>
        <input
          type="text"
          value={locationArea}
          onChange={(e) => setLocationArea(e.target.value)}
          placeholder="e.g. Auckland CBD, Ponsonby"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-trust-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          What happened? <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what happened in as much detail as you feel comfortable sharing..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-28 focus:ring-2 focus:ring-trust-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Client description <span className="text-xs text-gray-400">(helps others identify)</span>
        </label>
        <input
          type="text"
          value={clientDescription}
          onChange={(e) => setClientDescription(e.target.value)}
          placeholder="Name used, approximate age, any identifying details"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-trust-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Physical description <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={physicalDescription}
          onChange={(e) => setPhysicalDescription(e.target.value)}
          placeholder="Height, build, hair, distinguishing features"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-trust-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Vehicle description <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={vehicleDescription}
          onChange={(e) => setVehicleDescription(e.target.value)}
          placeholder="Make, model, colour, plate number"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-trust-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          How did they contact you? <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={contactMethod}
          onChange={(e) => setContactMethod(e.target.value)}
          placeholder="e.g. Through Shub, phone call, text"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-trust-500"
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={policeReportFiled}
            onChange={(e) => setPoliceReportFiled(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-trust-600 focus:ring-trust-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">I have filed a police report</span>
            <p className="text-xs text-gray-500 mt-0.5">
              We encourage filing a report. NZ Police: 105 (non-emergency) or 111 (emergency)
            </p>
          </div>
        </label>
        {policeReportFiled && (
          <input
            type="text"
            value={policeReportNumber}
            onChange={(e) => setPoliceReportNumber(e.target.value)}
            placeholder="Police report number (optional)"
            className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-trust-500"
          />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('type')}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('confirm')}
          disabled={!description.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          Review
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Review Your Alert</h2>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-500">Incident type:</span>
          <p className="text-gray-800">{selectedType?.label}</p>
        </div>
        <div>
          <span className="font-medium text-gray-500">Date:</span>
          <p className="text-gray-800">{new Date(incidentDate).toLocaleDateString('en-NZ')}</p>
        </div>
        {locationArea && (
          <div>
            <span className="font-medium text-gray-500">Area:</span>
            <p className="text-gray-800">{locationArea}</p>
          </div>
        )}
        <div>
          <span className="font-medium text-gray-500">Description:</span>
          <p className="text-gray-800">{description}</p>
        </div>
        {clientDescription && (
          <div>
            <span className="font-medium text-gray-500">Client description:</span>
            <p className="text-gray-800">{clientDescription}</p>
          </div>
        )}
      </div>

      <div className="bg-trust-50 border border-trust-200 rounded-xl p-3 space-y-1.5">
        <p className="text-sm font-medium text-trust-800">Before submitting:</p>
        <p className="text-xs text-trust-700">
          • Your identity will <strong>never</strong> be revealed to the reported person
        </p>
        <p className="text-xs text-trust-700">
          • Other providers in your area will see this alert anonymously
        </p>
        <p className="text-xs text-trust-700">
          • Platform moderators may review for accuracy
        </p>
        <p className="text-xs text-trust-700">
          • You can retract this alert later if needed
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('details')}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Alert'}
          <ShieldAlert className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderSubmitted = () => (
    <div className="space-y-6 text-center py-4">
      <div className="w-16 h-16 rounded-full bg-safe-100 flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-safe-600" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Alert Submitted</h2>
        <p className="text-sm text-gray-600 mt-2">
          Thank you for helping keep the community safe. Your alert has been submitted anonymously
          and will be visible to other providers in your area.
        </p>
      </div>

      {selectedType?.severity === 'critical' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
          <p className="text-sm font-semibold text-red-800 mb-2">This is a critical incident</p>
          <p className="text-xs text-red-700 mb-2">
            Our moderation team has been alerted. We strongly recommend:
          </p>
          <div className="space-y-1.5">
            <a href="tel:111" className="flex items-center gap-2 text-xs text-red-700 font-medium">
              <Phone className="w-3 h-3" /> NZ Police: 111
            </a>
            <a href="tel:0800762753" className="flex items-center gap-2 text-xs text-red-700 font-medium">
              <Phone className="w-3 h-3" /> NZPC Helpline: 0800 762 753
            </a>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <a
          href="https://www.nzpc.org.nz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-trust-600 font-medium hover:text-trust-700"
        >
          <ExternalLink className="w-4 h-4" />
          NZPC Support Resources
        </a>
      </div>

      <button
        onClick={onComplete}
        className="w-full px-4 py-3 bg-trust-600 text-white rounded-xl font-semibold hover:bg-trust-700 transition-colors"
      >
        Done
      </button>
    </div>
  );

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
      {step === 'type' && renderTypeSelection()}
      {step === 'details' && renderDetails()}
      {step === 'confirm' && renderConfirmation()}
      {step === 'submitted' && renderSubmitted()}
    </div>
  );
};

export default UglyMugsAlert;
