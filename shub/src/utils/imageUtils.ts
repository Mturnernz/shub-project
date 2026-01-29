// Image utility functions for photo management without external dependencies

export interface CompressedImage {
  file: File;
  url: string;
  isCompressed: boolean;
}

export const compressImage = async (file: File, maxSizeMB: number = 2, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const maxWidth = 1920;
      const maxHeight = 1920;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            // Check if size is acceptable
            if (compressedFile.size <= maxSizeMB * 1024 * 1024) {
              resolve(compressedFile);
            } else {
              // Try with lower quality
              canvas.toBlob(
                (blob2) => {
                  if (blob2) {
                    const finalFile = new File([blob2], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    });
                    resolve(finalFile);
                  } else {
                    resolve(file); // Return original if compression fails
                  }
                },
                'image/jpeg',
                0.6
              );
            }
          } else {
            resolve(file); // Return original if compression fails
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB before compression
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }
  
  return { valid: true };
};

export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};