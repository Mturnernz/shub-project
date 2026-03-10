import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, User, FileText, MapPin, Image as ImageIcon } from 'lucide-react';
import { User as UserType } from '../../../types';
import { locations } from '../../../data/mockData';
import PhotoManager from './PhotoManager';

interface Props {
  profile: UserType;
  userId: string;
  onSave: (updates: Partial<UserType>) => Promise<void>;
  onDismiss: () => void;
}

const STEPS = [
  { id: 'name',     label: 'Display Name', icon: User,      hint: 'What should clients call you?' },
  { id: 'bio',      label: 'Your Bio',     icon: FileText,  hint: 'Tell clients about yourself' },
  { id: 'location', label: 'Location',     icon: MapPin,    hint: 'Where are you based?' },
  { id: 'photos',   label: 'Photos',       icon: ImageIcon, hint: 'Upload at least 3 photos' },
] as const;

type StepId = typeof STEPS[number]['id'];

const MIN_BIO = 100;
const MIN_PHOTOS = 3;
const NZ_LOCATIONS = locations.slice(1); // drop 'All Locations'

const ProfileSetupWizard: React.FC<Props> = ({ profile, userId, onSave, onDismiss }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-step local state (seeded from profile)
  const [name, setName] = useState(profile.name ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [location, setLocation] = useState(profile.primaryLocation ?? '');
  const [photos, setPhotos] = useState(profile.profilePhotos ?? []);
  const [photoSettings, setPhotoSettings] = useState(profile.photoSettings ?? {});

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  // Completion check for the 3 required fields
  const bioComplete = bio.trim().length >= MIN_BIO;
  const locationComplete = location.trim().length > 0;
  const photosComplete = photos.length >= MIN_PHOTOS;
  const allComplete = bioComplete && locationComplete && photosComplete;

  // Per-step validation before advancing
  const stepValid = (): boolean => {
    switch (step.id as StepId) {
      case 'name':     return name.trim().length > 0;
      case 'bio':      return bioComplete;
      case 'location': return locationComplete;
      case 'photos':   return true; // photos save on upload; any count ok to proceed
      default:         return true;
    }
  };

  const saveCurrentStep = async () => {
    const updates: Partial<UserType> = {};
    switch (step.id as StepId) {
      case 'name':     if (name.trim() !== profile.name)            updates.name = name.trim(); break;
      case 'bio':      if (bio !== profile.bio)                     updates.bio = bio; break;
      case 'location': if (location !== profile.primaryLocation)    updates.primaryLocation = location; break;
      case 'photos':   /* saved immediately by PhotoManager */      break;
    }
    if (Object.keys(updates).length > 0) await onSave(updates);
  };

  const handleNext = async () => {
    if (!stepValid()) return;
    setSaving(true);
    setError(null);
    try {
      await saveCurrentStep();
      if (isLast) {
        onDismiss();
      } else {
        setStepIndex(i => i + 1);
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveCurrentStep();
      setStepIndex(i => i - 1);
    } catch {
      // best-effort — still navigate back
      setStepIndex(i => i - 1);
    } finally {
      setSaving(false);
    }
  };

  const nextLabel = () => {
    if (saving) return 'Saving…';
    if (isLast) return allComplete ? 'Finish' : 'Finish setup';
    return 'Next';
  };

  const renderStepContent = () => {
    switch (step.id as StepId) {

      case 'name':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Use a working name — your real name is never shown publicly.
            </p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
                placeholder="e.g. Sofia, Alex, Riley…"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-500"
              />
            </div>
          </div>
        );

      case 'bio':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Tell potential clients about your experience, personality, and what makes you unique.
              At least {MIN_BIO} characters required.
            </p>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={5000}
              rows={7}
              placeholder="Write a professional bio that showcases your personality, experience, and what makes you special…"
              className={`w-full p-4 border-2 rounded-xl resize-none focus:outline-none transition-colors ${
                bio.length === 0
                  ? 'border-gray-300 focus:border-trust-500'
                  : bioComplete
                  ? 'border-green-400 focus:border-green-500'
                  : 'border-orange-300 focus:border-orange-500'
              }`}
            />
            <div className="flex justify-between text-sm">
              <span className={bioComplete ? 'text-green-600' : 'text-orange-600'}>
                {bio.length} / {MIN_BIO} minimum
                {!bioComplete && bio.length > 0 && ` — ${MIN_BIO - bio.length} more needed`}
              </span>
              {bioComplete && <span className="text-green-600 font-medium">Bio ready</span>}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Your primary city. This helps clients find you in search.
            </p>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-500 bg-white appearance-none"
              >
                <option value="">Select your city…</option>
                {NZ_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Upload at least {MIN_PHOTOS} photos. You can add up to 10 and control blur / watermark settings later.
            </p>
            <div className={`rounded-xl p-1 transition-colors ${photos.length >= MIN_PHOTOS ? 'ring-2 ring-green-400' : ''}`}>
              <PhotoManager
                photos={photos}
                photoSettings={photoSettings}
                onPhotosUpdate={updated => {
                  setPhotos(updated);
                  onSave({ profilePhotos: updated });
                }}
                onPhotoSettingsUpdate={updated => {
                  setPhotoSettings(updated);
                  onSave({ photoSettings: updated });
                }}
                userId={userId}
              />
            </div>
            <p className={`text-sm font-medium text-center ${photos.length >= MIN_PHOTOS ? 'text-green-600' : 'text-gray-400'}`}>
              {photos.length} / {MIN_PHOTOS} required uploaded
            </p>
          </div>
        );
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-trust-600 to-rose-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Set up your profile</h2>
            <button
              onClick={onDismiss}
              className="text-white/70 hover:text-white text-sm underline"
            >
              Skip for now
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <React.Fragment key={s.id}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    done    ? 'bg-white text-trust-600' :
                    active  ? 'bg-white/30 ring-2 ring-white text-white' :
                              'bg-white/15 text-white/50'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-white' : 'bg-white/25'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Current step label */}
          <div className="mt-3">
            <p className="font-semibold">{step.label}</p>
            <p className="text-trust-100 text-sm">{step.hint}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={isFirst || saving}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex-1 text-center text-sm text-gray-400">
            {stepIndex + 1} of {STEPS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={saving || (!stepValid() && step.id !== 'photos')}
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-gradient-to-r from-trust-600 to-rose-600 text-white font-semibold hover:from-trust-700 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {nextLabel()}
            {!isLast && !saving && <ChevronRight className="w-4 h-4" />}
            {isLast && !saving && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupWizard;
