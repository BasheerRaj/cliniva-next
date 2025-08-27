'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, XCircle, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';

interface DocumentUploadProps {
  onFileUpload: (file: File) => Promise<{ url: string; id: string }>;
  currentFileUrl?: string | null;
  disabled?: boolean;
  progress?: number;
  error?: string | null;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileUpload,
  currentFileUrl,
  disabled = false,
  progress = 0,
  error,
  acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  maxSize = 10 * 1024 * 1024, // 10MB
  label = 'Upload Document',
  description = 'PDF, Word, or Text files up to 10MB',
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await onFileUpload(file);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    disabled: disabled || isUploading
  });

  // Get file type icon
  const getFileIcon = () => {
    if (currentFileUrl?.includes('.pdf')) {
      return <FileText className="h-8 w-8 text-red-600" />;
    }
    if (currentFileUrl?.includes('.doc') || currentFileUrl?.includes('.docx')) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    }
    return <FileText className="h-8 w-8 text-gray-600" />;
  };

  // Get upload status
  const getUploadStatus = () => {
    if (isUploading) return 'uploading';
    if (uploadError || error) return 'error';
    if (currentFileUrl) return 'success';
    return 'idle';
  };

  const status = getUploadStatus();
  const hasFileRejections = fileRejections.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      
      {/* Current File Display */}
      {currentFileUrl && status !== 'uploading' && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <p className="text-sm font-medium text-green-800">Document uploaded</p>
              <p className="text-xs text-green-600">Click to view or replace</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(currentFileUrl, '_blank')}
            >
              View
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {(!currentFileUrl || status === 'uploading') && (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
            isDragActive && !isDragReject && 'border-blue-400 bg-blue-50',
            isDragReject && 'border-red-400 bg-red-50',
            status === 'error' && 'border-red-400 bg-red-50',
            disabled && 'cursor-not-allowed opacity-50',
            !isDragActive && !isDragReject && status !== 'error' && 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          
          <div className="text-center">
            <div className="mx-auto mb-4">
              {status === 'uploading' ? (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              ) : status === 'error' ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : status === 'success' ? (
                <Check className="h-12 w-12 text-green-500" />
              ) : (
                <UploadCloud className="h-12 w-12 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">
                {status === 'uploading' ? 'Uploading...' : 
                 status === 'error' ? 'Upload Failed' :
                 status === 'success' ? 'Upload Complete' :
                 isDragActive ? 'Drop file here' : label}
              </p>
              
              <p className="text-sm text-muted-foreground">
                {status === 'uploading' ? `Uploading document... ${progress.toFixed(0)}%` :
                 status === 'error' ? (uploadError || error || 'Please try again') :
                 status === 'success' ? 'Document uploaded successfully' :
                 description}
              </p>

              {status === 'uploading' && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {status === 'idle' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className="mt-2"
                >
                  Select File
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Rejection Errors */}
      {hasFileRejections && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-4 w-4 text-red-500" />
              <div className="text-sm">
                <p className="font-medium text-red-800">
                  {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <ul className="text-red-600 list-disc list-inside">
                  {errors.map((error, errorIndex) => (
                    <li key={errorIndex}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Type Information */}
      <div className="text-xs text-muted-foreground">
        <p><strong>Accepted formats:</strong> PDF, Word documents (.doc, .docx), Text files (.txt)</p>
        <p><strong>Maximum size:</strong> {(maxSize / 1024 / 1024).toFixed(0)} MB</p>
      </div>
    </div>
  );
};
