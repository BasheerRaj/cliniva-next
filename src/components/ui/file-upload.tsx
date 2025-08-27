'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onFileUpload?: (file: File) => Promise<{ url: string; id: string }>;
  onUploadComplete?: (result: { url: string; id: string }) => void;
  onError?: (error: string) => void;
  accept?: string[];
  maxSize?: number;
  preview?: boolean;
  className?: string;
  disabled?: boolean;
  value?: string; // URL of already uploaded file
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileUpload,
  onUploadComplete,
  onError,
  accept = ['image/*'],
  maxSize = 5 * 1024 * 1024, // 5MB
  preview = true,
  className,
  disabled = false,
  value
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>(value || '');
  const [error, setError] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setError('');

    // Validate file size
    if (file.size > maxSize) {
      const errorMsg = `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Call file select callback
    onFileSelect?.(file);

    // If upload handler is provided, upload the file
    if (onFileUpload) {
      setUploading(true);
      setUploadProgress(0);

      try {
        // Simulate progress (in real implementation, you'd get this from upload)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const result = await onFileUpload(file);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadedUrl(result.url);
        onUploadComplete?.(result);
        
        // Reset progress after a delay
        setTimeout(() => setUploadProgress(0), 1000);
      } catch (err: any) {
        const errorMsg = err.message || 'Upload failed';
        setError(errorMsg);
        onError?.(errorMsg);
        setUploadProgress(0);
      } finally {
        setUploading(false);
      }
    }
  }, [onFileSelect, onFileUpload, onUploadComplete, onError, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: disabled || uploading
  });

  const removeFile = () => {
    setUploadedUrl('');
    setError('');
    setUploadProgress(0);
  };

  // Show uploaded file preview
  if (uploadedUrl && preview) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {uploadedUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img 
                  src={uploadedUrl} 
                  alt="Uploaded file" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileImage className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">File uploaded</p>
              <p className="text-xs text-muted-foreground">
                Click to replace
              </p>
            </div>
            <Check className="h-5 w-5 text-green-500" />
          </div>
          
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Hidden dropzone for replacement */}
        {!disabled && (
          <div {...getRootProps()} className="mt-2">
            <input {...getInputProps()} />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="w-full"
              disabled={uploading}
            >
              Replace File
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500 bg-red-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="flex justify-center">
            {uploading ? (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            ) : error ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>

          {/* Upload Text */}
          <div className="space-y-2">
            {uploading ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {uploadProgress}% complete
                </p>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">Upload failed</p>
                <p className="text-xs text-red-500">{error}</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setError('')}
                >
                  Try Again
                </Button>
              </div>
            ) : isDragActive ? (
              <p className="text-sm font-medium text-blue-600">
                Drop the file here...
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  {accept.join(', ')} up to {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            )}
          </div>

          {/* Browse Button */}
          {!uploading && !error && !isDragActive && (
            <Button type="button" variant="outline" size="sm" disabled={disabled}>
              Browse Files
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// Logo-specific upload component
export const LogoUpload: React.FC<Omit<FileUploadProps, 'accept' | 'maxSize'>> = (props) => {
  return (
    <FileUpload
      {...props}
      accept={['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']}
      maxSize={1 * 1024 * 1024} // 1MB
    />
  );
};

// Document upload component
export const DocumentUpload: React.FC<Omit<FileUploadProps, 'accept' | 'maxSize'>> = (props) => {
  return (
    <FileUpload
      {...props}
      accept={[
        'application/pdf',
        'text/plain', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]}
      maxSize={10 * 1024 * 1024} // 10MB
      preview={false}
    />
  );
};
