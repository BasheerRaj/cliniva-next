'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { onboardingApi } from '@/lib/api/onboarding';

interface UploadResult {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface UseFileUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
  endpoint?: string; // Optional endpoint override (e.g., 'logo', 'document')
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    onSuccess,
    onError,
    showToast = true,
    endpoint = ''
  } = options;

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      // Validate file size
      if (file.size > maxSizeBytes) {
        throw new Error(`File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
      }

      // Validate file type
      if (!file.type || !allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type || 'unknown'} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }

      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();
      const fieldName = endpoint === 'logo' ? 'logo' : endpoint === 'document' ? 'document' : 'file';
      formData.append(fieldName, file);

      // Upload with progress tracking to backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const uploadEndpoint = endpoint ? `/upload/${endpoint}` : '/upload';
      const response = await fetch(`${apiUrl}${uploadEndpoint}`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header, let the browser set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);

      // Convert backend URL to frontend proxy URL
      let frontendUrl = result.data.url;
      if (frontendUrl && frontendUrl.includes('/uploads/')) {
        // Extract the path after /uploads/
        const uploadPath = frontendUrl.substring(frontendUrl.indexOf('/uploads/') + 9);
        frontendUrl = `/api/uploads/${uploadPath}`;
      }

      // Backend returns data in result.data object
      return {
        id: result.data.id,
        url: frontendUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };
    },

    onSuccess: (result) => {
      setUploadProgress(0);
      
      if (showToast) {
        toast.success('📁 File uploaded successfully!', {
          description: `${result.name} has been uploaded.`,
        });
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['uploads'] });

      if (onSuccess) {
        onSuccess(result);
      }
    },

    onError: (error: any) => {
      setUploadProgress(0);
      
      console.error('File upload failed:', error);

      if (showToast) {
        toast.error('❌ Upload failed', {
          description: error.message || 'Failed to upload file. Please try again.',
        });
      }

      if (onError) {
        onError(error);
      }
    },

    retry: (failureCount, error: any) => {
      // Don't retry on validation errors (client-side issues)
      if (error.message?.includes('File size') || error.message?.includes('File type')) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },

    retryDelay: 1000,
  });

  const uploadFile = useCallback((file: File) => {
    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        const result = await uploadMutation.mutateAsync(file);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
    }
    
    return results;
  }, [uploadMutation]);

  return {
    uploadFile,
    uploadFiles,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error: uploadMutation.error,
    result: uploadMutation.data,
    reset: uploadMutation.reset
  };
};

// Hook for image upload with compression
export const useImageUpload = (options: UseFileUploadOptions = {}) => {
  const [isCompressing, setIsCompressing] = useState(false);

  const defaultOptions = {
    ...options,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 2 * 1024 * 1024, // 2MB for images
    endpoint: options.endpoint || 'logo'
  };

  const fileUpload = useFileUpload(defaultOptions);

  const compressImage = useCallback(async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
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
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadImage = useCallback(async (file: File, compress: boolean = true) => {
    if (compress && file.size > 500 * 1024) { // Compress if > 500KB
      setIsCompressing(true);
      try {
        const compressedFile = await compressImage(file);
        fileUpload.uploadFile(compressedFile);
      } catch (error) {
        console.error('Image compression failed:', error);
        fileUpload.uploadFile(file); // Fallback to original
      } finally {
        setIsCompressing(false);
      }
    } else {
      fileUpload.uploadFile(file);
    }
  }, [fileUpload, compressImage]);

  return {
    ...fileUpload,
    uploadImage,
    isCompressing,
    totalProgress: isCompressing ? 50 : fileUpload.uploadProgress
  };
};

// Hook for logo upload specifically
export const useLogoUpload = (options: Omit<UseFileUploadOptions, 'allowedTypes' | 'maxSizeBytes' | 'endpoint'> = {}) => {
  return useImageUpload({
    ...options,
    allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    maxSizeBytes: 1 * 1024 * 1024, // 1MB for logos
    endpoint: 'logo'
  });
};

// Hook for document upload (T&C, Privacy Policy)
export const useDocumentUpload = (options: UseFileUploadOptions = {}) => {
  const defaultOptions = {
    ...options,
    allowedTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB for documents
    endpoint: 'document'
  };

  return useFileUpload(defaultOptions);
};
