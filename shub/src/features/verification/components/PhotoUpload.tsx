import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertTriangle, Check } from 'lucide-react';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  minPhotos?: number;
  disabled?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  minPhotos = 3,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (disabled || uploading) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setUploading(true);

    try {
      const newPhotoUrls: string[] = [];

      for (const file of filesToProcess) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.warn('Skipping non-image file:', file.name);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn('Skipping large file:', file.name);
          continue;
        }

        // Create object URL for preview (in real app, would upload to Supabase Storage)
        const objectUrl = URL.createObjectURL(file);
        newPhotoUrls.push(objectUrl);
      }

      if (newPhotoUrls.length > 0) {
        onPhotosChange([...photos, ...newPhotoUrls]);
      }
    } catch (error) {
      console.error('Error processing photos:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    if (disabled) return;

    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const isMinimumMet = photos.length >= minPhotos;
  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Photos</h3>
          <p className="text-sm text-gray-600">
            Add at least {minPhotos} photos (max {maxPhotos})
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isMinimumMet ? (
            <Check className="w-5 h-5 text-safe-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
          <span className={`text-sm font-medium ${isMinimumMet ? 'text-safe-600' : 'text-yellow-600'}`}>
            {photos.length}/{minPhotos} minimum
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Existing Photos */}
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={photo}
              alt={`Profile photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* Upload Slot */}
        {canAddMore && !disabled && (
          <div
            className={`
              aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
              ${dragOver
                ? 'border-trust-500 bg-trust-50'
                : 'border-gray-300 hover:border-trust-400 hover:bg-gray-50'
              }
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-600" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 text-center">
                  Click or drag photos here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Up to 5MB each
                </p>
              </>
            )}
          </div>
        )}

        {/* Empty slots indicator */}
        {photos.length < minPhotos && (
          Array.from({ length: minPhotos - photos.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
            >
              <div className="text-center">
                <Image className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Required</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Requirements */}
      <div className="p-4 bg-trust-50 border border-trust-200 rounded-lg">
        <h4 className="font-medium text-trust-900 mb-2">Photo Guidelines</h4>
        <ul className="text-sm text-trust-800 space-y-1">
          <li>• At least {minPhotos} photos required to publish your profile</li>
          <li>• First photo will be your primary profile picture</li>
          <li>• Photos should be clear and well-lit</li>
          <li>• Professional appearance recommended</li>
          <li>• Maximum file size: 5MB per photo</li>
        </ul>
      </div>

      {/* Watermark Notice */}
      <div className="p-3 bg-trust-50 border border-trust-200 rounded-lg">
        <p className="text-sm text-trust-700">
          <strong>Privacy Protection:</strong> All photos will include a discrete watermark with your profile ID to prevent unauthorized use.
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;