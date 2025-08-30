import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormFieldWithIconProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  icon: LucideIcon;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  min?: number;
  max?: number;
  className?: string;
  multiline?: boolean;
  minHeight?: string;
}

export function FormFieldWithIcon<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  icon: Icon,
  required = false,
  disabled = false,
  type = "text",
  min,
  max,
  className = "",
  multiline = false,
  minHeight = "100px"
}: FormFieldWithIconProps<TFieldValues>) {
  const baseInputClasses = "h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground";
  const inputStyle = {
    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
    borderRadius: '8px'
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="block text-sm font-bold text-primary font-lato">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {multiline ? (
                <div className="absolute left-4 top-4 z-10">
                  <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                </div>
              ) : (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                </div>
              )}
              {multiline ? (
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`${baseInputClasses} min-h-[${minHeight}] pl-12 pr-4 pt-4 pb-4 resize-none ${className}`}
                  style={inputStyle}
                />
              ) : (
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                  min={min}
                  max={max}
                  className={`${baseInputClasses} ${className}`}
                  style={inputStyle}
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
