import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { debounce } from '../../../utils/debounce';
import { showToast } from '../../../utils/toast';
import { useSavedIndicator } from '../../../hooks/useSavedIndicator';

interface BioEditorProps {
  bio: string;
  onBioUpdate: (bio: string) => void;
}

const BioEditor: React.FC<BioEditorProps> = ({ bio, onBioUpdate }) => {
  const [localBio, setLocalBio] = useState(bio);
  const [charCount, setCharCount] = useState(bio.length);
  const { saved: showSaved, saving: isSaving, triggerSave } = useSavedIndicator();

  const minChars = 100;
  const maxChars = 5000;
  
  const isValid = charCount >= minChars && charCount <= maxChars;
  const isAtLimit = charCount >= maxChars;

  // Debounced save function
  const debouncedSave = debounce(async (bioText: string) => {
    if (bioText !== bio && isValid) {
      try {
        await triggerSave(() => onBioUpdate(bioText));
        showToast.success('Bio saved');
      } catch (error) {
        console.error('Error saving bio:', error);
        showToast.error('Failed to save bio');
      }
    }
  }, 2000);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    
    if (newBio.length <= maxChars) {
      setLocalBio(newBio);
      setCharCount(newBio.length);
      debouncedSave(newBio);
    }
  };

  useEffect(() => {
    setLocalBio(bio);
    setCharCount(bio.length);
  }, [bio]);

  const bioPrompts = [
    "Tell potential clients about your experience and expertise.",
    "What makes you unique as a service provider?",
    "Describe your approach and what clients can expect.",
    "Share your background and qualifications.",
    "What are your specialties and interests?",
  ];

  const getCharCountColor = () => {
    if (charCount < minChars) return 'text-orange-600';
    if (charCount > maxChars * 0.9) return 'text-red-600';
    return 'text-safe-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Professional Bio</h3>
        <div className="flex items-center space-x-2">
          {isSaving && (
            <span className="text-sm text-trust-600">Saving...</span>
          )}
          {showSaved && !isSaving && (
            <span className="text-sm text-safe-600 font-medium animate-pulse">✓ Saved</span>
          )}
        </div>
      </div>

      {/* Writing prompts */}
      <div className="bg-trust-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-trust-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Writing Tips
        </h4>
        <ul className="text-sm text-trust-800 space-y-1">
          {bioPrompts.map((prompt, index) => (
            <li key={index} className="flex items-start">
              <span className="text-trust-400 mr-2">•</span>
              {prompt}
            </li>
          ))}
        </ul>
      </div>

      {/* Bio textarea */}
      <div className="space-y-2">
        <textarea
          value={localBio}
          onChange={handleBioChange}
          placeholder="Write a professional bio that showcases your personality, experience, and what makes you special. Be authentic and engaging to attract the right clients..."
          className={`w-full h-48 p-4 border-2 rounded-xl resize-none transition-colors focus:outline-none ${
            isValid 
              ? 'border-gray-300 focus:border-trust-500' 
              : charCount < minChars
              ? 'border-orange-300 focus:border-orange-500'
              : 'border-red-300 focus:border-red-500'
          }`}
          maxLength={maxChars}
        />
        
        <div className="flex items-center justify-between">
          <div className={`text-sm ${getCharCountColor()}`}>
            {charCount} / {maxChars} characters
            {charCount < minChars && (
              <span className="ml-2 text-orange-600">
                ({minChars - charCount} more needed)
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {isValid ? (
              <span className="text-safe-600 flex items-center">
                <span className="w-2 h-2 bg-safe-500 rounded-full mr-2"></span>
                Bio is ready
              </span>
            ) : (
              <span className="text-orange-600">
                Minimum {minChars} characters required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio preview */}
      {localBio && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {localBio}
          </div>
        </div>
      )}
    </div>
  );
};

export default BioEditor;