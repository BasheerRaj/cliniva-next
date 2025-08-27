'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLogoUpload } from '@/hooks/onboarding/api/useFileUpload';

interface LogoUploadProps {
  value?: string; // Current logo URL
  onChange: (logoUrl: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Upload your logo'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoUpload = useLogoUpload({
    onSuccess: (result) => {
      // Use the backend URL format (relative path)
      const backendUrl = result.url.replace('/api/uploads/', '/uploads/');
      onChange(backendUrl);
      toast.success('Logo uploaded successfully!');
    },
    onError: (error) => {
      toast.error('Failed to upload logo: ' + error.message);
    },
    showToast: false // We handle toasts manually
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      logoUpload.uploadImage(file);
    }
    // Reset input to allow re-uploading the same file
    event.target.value = '';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeLogo = () => {
    onChange('');
  };

  // Convert relative backend URL to frontend proxy URL for display
  const getDisplayUrl = (logoUrl?: string) => {
    if (!logoUrl) return null;
    
    if (logoUrl.startsWith('/uploads/')) {
      // Convert backend relative path to frontend proxy URL
      const uploadPath = logoUrl.substring(9); // Remove '/uploads/'
      return `/api/uploads/${uploadPath}`;
    }
    
    return logoUrl; // Return as-is for external URLs
  };

  const displayUrl = getDisplayUrl(value);
  const isUploading = logoUpload.isUploading || logoUpload.isCompressing;

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/svg+xml,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {displayUrl ? (
            // Logo Preview
            <div className="relative group">
              <div className="aspect-video w-full max-w-xs mx-auto bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
                <img
                  src={displayUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Failed to load logo:', displayUrl);
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Overlay buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2 rounded-lg">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={triggerFileSelect}
                  disabled={disabled || isUploading}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={removeLogo}
                  disabled={disabled || isUploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            // Upload Area
            <div
              className="aspect-video w-full max-w-xs mx-auto border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
              onClick={triggerFileSelect}
            >
              {isUploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-gray-600">
                    {logoUpload.isCompressing ? 'Compressing...' : 'Uploading...'}
                  </p>
                  {logoUpload.uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${logoUpload.uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 text-center">
                    {placeholder}
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    PNG, JPG, SVG or WebP (max 1MB)
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Button */}
      {!displayUrl && !isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileSelect}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose Logo File
        </Button>
      )}
    </div>
  );
}; 