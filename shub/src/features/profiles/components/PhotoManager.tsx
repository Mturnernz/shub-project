import React, { useState, useRef } from 'react';
import { Upload, X, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { compressImage, validateImageFile, createImagePreview, revokeImagePreview } from '../../../utils/imageUtils';
import { supabase } from '../../../lib/supabase';

interface PhotoManagerProps {
  photos: string[];
  onPhotosUpdate: (photos: string[]) => void;
  userId: string;
}

interface PhotoItem {
  url: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({ photos, onPhotosUpdate, userId }) => {
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>(
    photos.map(url => ({ url }))
  );
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = 10 - photoItems.length;
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more photos (maximum 10 total)`);
      return;
    }

    setError(null);
    const newPhotos: PhotoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        continue;
      }

      const previewUrl = createImagePreview(file);
      const photoItem: PhotoItem = {
        url: previewUrl,
        isUploading: true,
        uploadProgress: 0,
      };
      
      newPhotos.push(photoItem);
    }

    setPhotoItems(prev => [...prev, ...newPhotos]);

    // Upload files
    for (let i = 0; i < newPhotos.length; i++) {
      try {
        const file = files[i];
        const compressedFile = await compressImage(file);
        
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        // Update photo item with final URL
        setPhotoItems(prev => prev.map((item, index) => {
          if (item.url === newPhotos[i].url) {
            revokeImagePreview(item.url); // Clean up preview URL
            return { url: publicUrl, isUploading: false };
          }
          return item;
        }));

        // Update parent component
        const updatedPhotos = photoItems.map(item => item.url).filter(url => !url.startsWith('blob:'));
        updatedPhotos.push(publicUrl);
        onPhotosUpdate(updatedPhotos);

      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload photo');
        
        // Remove failed photo
        setPhotoItems(prev => prev.filter(item => item.url !== newPhotos[i].url));
        revokeImagePreview(newPhotos[i].url);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const deletePhoto = async (photoUrl: string, index: number) => {
    try {
      // Extract filename from URL for Supabase storage
      const urlParts = photoUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // userId/filename
      
      if (fileName.includes(userId)) {
        await supabase.storage
          .from('profile-photos')
          .remove([fileName]);
      }

      const updatedPhotos = photoItems.filter((_, i) => i !== index).map(item => item.url);
      setPhotoItems(prev => prev.filter((_, i) => i !== index));
      onPhotosUpdate(updatedPhotos);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete photo');
    }
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photoItems.length) return;

    const updatedItems = [...photoItems];
    [updatedItems[index], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[index]];
    
    setPhotoItems(updatedItems);
    onPhotosUpdate(updatedItems.map(item => item.url));
  };

  const canAddMore = photoItems.length < 10;
  const hasMinimum = photoItems.length >= 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Profile Photos</h3>
        <span className={`text-sm ${hasMinimum ? 'text-green-600' : 'text-orange-600'}`}>
          {photoItems.length}/10 photos {!hasMinimum && '(minimum 3 required)'}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop photos here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            JPEG, PNG, WebP • Max 2MB each • {10 - photoItems.length} remaining
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-4">
        {photoItems.map((photo, index) => (
          <div key={index} className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-square relative">
              {photo.isUploading ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                </div>
              ) : (
                <img
                  src={photo.url}
                  alt={`Profile photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              
              {!photo.isUploading && (
                <button
                  onClick={() => deletePhoto(photo.url, index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {!photo.isUploading && photoItems.length > 1 && (
              <div className="p-2 flex justify-between items-center bg-gray-50">
                <span className="text-xs text-gray-600">Photo {index + 1}</span>
                <div className="flex space-x-1">
                  {index > 0 && (
                    <button
                      onClick={() => movePhoto(index, 'up')}
                      className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  {index < photoItems.length - 1 && (
                    <button
                      onClick={() => movePhoto(index, 'down')}
                      className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {photoItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No photos uploaded yet</p>
          <p className="text-sm">Add at least 3 professional photos</p>
        </div>
      )}
    </div>
  );
};

export default PhotoManager;