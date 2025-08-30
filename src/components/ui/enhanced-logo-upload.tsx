import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface EnhancedLogoUploadProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isUploading?: boolean;
  acceptedTypes?: string;
  maxSize?: number;
  onFileUpload?: (file: File) => Promise<void>;
}

export function EnhancedLogoUpload<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Click or Drag file to this area to upload",
  disabled = false,
  required = false,
  isUploading = false,
  acceptedTypes = "image/svg+xml,image/png,image/jpeg,image/gif",
  maxSize = 2 * 1024 * 1024, // 2MB
  onFileUpload
}: EnhancedLogoUploadProps<TFieldValues>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.split(',').some(type => file.type === type.trim())) {
      console.error('Please upload an SVG, PNG, JPG or GIF file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      console.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    if (onFileUpload) {
      await onFileUpload(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <FormLabel className="block text-sm font-bold text-primary font-lato">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <div
          className="border-2 border-dashed border-border-light bg-surface-tertiary rounded-lg p-8 text-center cursor-pointer hover:bg-surface-hover transition-colors"
          onClick={triggerFileUpload}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
            disabled={disabled}
          />
          {/* This will be populated by the parent form's field value */}
          <div className="flex flex-col items-center">
            <Upload className="w-6 h-6 mx-auto mb-2 text-text-secondary" />
            <p className="text-sm mb-1 text-primary-500">
              {isUploading ? 'Uploading...' : placeholder}
            </p>
            <p className="text-xs text-text-secondary">
              SVG, PNG, JPG or GIF, Maximum file size {maxSize / (1024 * 1024)}MB.
            </p>
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </div>
  );
}
