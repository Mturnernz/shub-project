import React, { useState } from 'react';
import { Plus, Trash2, Upload, FileText, Shield, Globe } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Language {
  language: string;
  proficiency: string;
}

interface LanguageQualificationsProps {
  languages: Language[];
  qualificationDocuments: string[];
  onLanguagesUpdate: (languages: Language[]) => void;
  onDocumentsUpdate: (documents: string[]) => void;
  userId: string;
}

const LanguageQualifications: React.FC<LanguageQualificationsProps> = ({
  languages,
  qualificationDocuments,
  onLanguagesUpdate,
  onDocumentsUpdate,
  userId,
}) => {
  const [localLanguages, setLocalLanguages] = useState<Language[]>(languages);
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('Conversational');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proficiencyLevels = [
    'Beginner',
    'Conversational',
    'Fluent',
    'Native',
  ];

  const commonLanguages = [
    'English', 'Mandarin', 'Spanish', 'Hindi', 'Arabic', 'Portuguese', 
    'Russian', 'Japanese', 'French', 'German', 'Korean', 'Italian',
    'Vietnamese', 'Thai', 'Dutch', 'Swedish', 'Norwegian', 'Polish',
  ];

  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    
    // Check if language already exists
    if (localLanguages.some(lang => lang.language.toLowerCase() === newLanguage.toLowerCase())) {
      setError('Language already added');
      return;
    }
    
    const newLang: Language = {
      language: newLanguage.trim(),
      proficiency: newProficiency,
    };
    
    const updatedLanguages = [...localLanguages, newLang];
    setLocalLanguages(updatedLanguages);
    onLanguagesUpdate(updatedLanguages);
    
    setNewLanguage('');
    setNewProficiency('Conversational');
    setError(null);
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = localLanguages.filter((_, i) => i !== index);
    setLocalLanguages(updatedLanguages);
    onLanguagesUpdate(updatedLanguages);
  };

  const updateProficiency = (index: number, proficiency: string) => {
    const updatedLanguages = [...localLanguages];
    updatedLanguages[index].proficiency = proficiency;
    setLocalLanguages(updatedLanguages);
    onLanguagesUpdate(updatedLanguages);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Validate file
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error(`File ${file.name} is too large (max 10MB)`);
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a supported format`);
        }

        // Upload to Supabase Storage
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('qualification-docs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('qualification-docs')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const updatedDocs = [...qualificationDocuments, ...uploadedUrls];
      onDocumentsUpdate(updatedDocs);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentUrl: string) => {
    try {
      // Extract filename from URL for Supabase storage
      const urlParts = documentUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // userId/filename
      
      if (fileName.includes(userId)) {
        await supabase.storage
          .from('qualification-docs')
          .remove([fileName]);
      }

      const updatedDocs = qualificationDocuments.filter(doc => doc !== documentUrl);
      onDocumentsUpdate(updatedDocs);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document');
    }
  };

  const getFileNameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1].split('-').slice(1).join('-'); // Remove timestamp prefix
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Languages & Qualifications</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Languages Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center">
          <Globe className="w-4 h-4 mr-2" />
          Languages Spoken
        </h4>

        {/* Add Language */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Add Language</h5>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
              >
                <option value="">Select language</option>
                {commonLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
              >
                {proficiencyLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={addLanguage}
              disabled={!newLanguage}
              className="px-4 py-2 bg-gradient-to-r from-trust-600 to-warm-600 text-white rounded-lg hover:from-trust-700 hover:to-warm-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add
            </button>
          </div>
        </div>

        {/* Language List */}
        <div className="space-y-3">
          {localLanguages.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No languages added yet</p>
              <p className="text-sm">Add languages you speak to attract more clients</p>
            </div>
          ) : (
            localLanguages.map((lang, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-trust-500 mr-2" />
                    <span className="font-medium text-gray-900">{lang.language}</span>
                  </div>
                  
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateProficiency(index, e.target.value)}
                    className="mt-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
                  >
                    {proficiencyLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => removeLanguage(index)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Qualifications Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Qualification Documents
        </h4>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-trust-400 hover:bg-trust-50 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Upload certificates, licenses, or other qualifications
          </p>
          <p className="text-sm text-gray-500 mb-4">
            PDF, JPEG, PNG, WebP • Max 10MB each
          </p>
          
          <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-trust-600 to-warm-600 text-white rounded-lg hover:from-trust-700 hover:to-warm-700 transition-all duration-200 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Select Documents'}
            <input
              type="file"
              multiple
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {qualificationDocuments.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload certificates or qualifications to build trust</p>
            </div>
          ) : (
            qualificationDocuments.map((doc, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <FileText className="w-5 h-5 text-trust-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 truncate">
                      {getFileNameFromUrl(doc)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Shield className="w-3 h-3 mr-1" />
                      Pending verification
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <a
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm text-trust-600 hover:text-trust-700 transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => deleteDocument(doc)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-trust-50 rounded-lg p-4">
        <h4 className="font-medium text-trust-900 mb-2">Guidelines</h4>
        <ul className="text-sm text-trust-800 space-y-1">
          <li>• <strong>Languages:</strong> Add all languages you can communicate in professionally</li>
          <li>• <strong>Qualifications:</strong> Upload relevant certificates, licenses, or training documents</li>
          <li>• <strong>Verification:</strong> Documents will be reviewed for verification status</li>
          <li>• <strong>Privacy:</strong> Your documents are stored securely and only visible to platform administrators for verification</li>
        </ul>
      </div>
    </div>
  );
};

export default LanguageQualifications;