'use client';

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, BuildingIcon, StethoscopeIcon, Upload, Calendar, Building, FileText, User, Hash, Target, Eye, MapPinIcon, PhoneIcon, MailIcon, GlobeIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from 'sonner';
import { ClinicOverviewDto } from '@/types/onboarding';
import { saveClinicOverview } from '@/api/onboardingApiClient';
import { LogoUpload } from '@/components/ui/logo-upload';
import { useUniqueValidation, getValidationStatusClass, getValidationMessage } from '@/hooks/useUniqueValidation';
import { useDepartmentsByComplex, useDepartments } from '@/hooks/api/useDepartments';
import { DepartmentSearchInput, Department } from '@/components/ui/department-search-input';
import { useClivinaTheme } from "@/hooks/useClivinaTheme";
import { FormFieldWithIcon } from '@/components/ui/form-field-with-icon';
import { ValidationMessage } from '@/components/ui/validation-message';

// Services validation removed - handled in ClinicServicesCapacityForm

// Form validation schema matching new ClinicOverviewDto (without services and capacity fields)
const clinicOverviewSchema = z.object({
  // Required fields
  name: z.string()
    .min(2, 'Clinic name must be at least 2 characters')
    .max(100, 'Clinic name must be less than 100 characters')
    .trim(),
  
  // Optional basic info
  headDoctorName: z.string()
    .max(50, 'Head doctor name must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  specialization: z.string()
    .max(100, 'Specialization must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  licenseNumber: z.string()
    .max(50, 'License number must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  pin: z.string()
    .max(20, 'PIN must be less than 20 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  logoUrl: z.string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val === '' ||
        z.string().url().safeParse(val).success ||
        val.startsWith('/uploads/'),
      {
        message: 'Please provide a valid logo URL'
      }
    ),
  website: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Please provide a valid website URL (e.g., https://example.com)'
    }),
    
  // Flattened business profile fields
  yearEstablished: z.number()
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
  mission: z.string()
    .max(500, 'Mission statement must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  vision: z.string()
    .max(500, 'Vision statement must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  overview: z.string()
    .max(1000, 'Overview must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  goals: z.string()
    .max(1000, 'Goals must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  ceoName: z.string()
    .max(50, 'CEO name must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
    
  complexDepartmentId: z.string().optional(),
  
  // Contact information fields
  address: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    googleLocation: z.string().optional().or(z.literal(''))
  }).optional(),
  
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phoneNumbers: z.array(z.object({
    number: z.string().min(1, 'Phone number is required'),
    type: z.enum(['primary', 'secondary', 'emergency', 'fax', 'mobile']),
    label: z.string().optional().or(z.literal(''))
  })).optional(),
  
  emergencyContact: z.object({
    name: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    email: z.string().email('Please enter a valid emergency contact email').optional().or(z.literal('')),
    relationship: z.string().optional().or(z.literal(''))
  }).optional(),
  
  socialMediaLinks: z.object({
    facebook: z.string().optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    linkedin: z.string().optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
    youtube: z.string().optional().or(z.literal('')),
    website: z.string().optional().or(z.literal(''))
  }).optional()
});

type ClinicOverviewFormData = z.infer<typeof clinicOverviewSchema>;

interface ClinicOverviewFormProps {
  onNext: (data: ClinicOverviewDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ClinicOverviewDto>;
  parentData?: any; // Complex or Organization data for inheritance
  availableDepartments?: Array<{ id: string; name: string; description?: string }>;  // Updated interface
  isLoading?: boolean;
  planType?: 'company' | 'complex' | 'clinic';
  formData?: any;
  currentStep?: number;
  complexId?: string; // Complex ID for department loading
}

export const ClinicOverviewForm: React.FC<ClinicOverviewFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  parentData,
  availableDepartments = [], // Keep for backward compatibility
  isLoading = false,
  planType,
  complexId
}) => {
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isEmergencyExpanded, setIsEmergencyExpanded] = useState(false);
  const [isSocialMediaExpanded, setIsSocialMediaExpanded] = useState(false);
  const [useInheritance, setUseInheritance] = useState(false);

  // Determine which departments to load based on plan type
  const effectiveComplexId = complexId || parentData?.id || parentData?._id;
  const shouldLoadAllDepartments = planType === 'clinic';
  const shouldLoadComplexDepartments = (planType === 'complex' || planType === 'company') && effectiveComplexId;

  // Debug logging (console)
  console.log('🏥 ClinicOverviewForm Department Loading:', {
    planType,
    complexId,
    parentDataId: parentData?.id || parentData?._id,
    effectiveComplexId,
    shouldLoadAllDepartments,
    shouldLoadComplexDepartments
  });

  // Load complex departments if complexId is provided (for complex/company plans)
  const { data: complexDepartments = [], isLoading: isComplexDepartmentsLoading } = useDepartmentsByComplex(
    shouldLoadComplexDepartments ? effectiveComplexId : undefined
  );
  
  // Load all departments for clinic plan
  const { data: allDepartments = [], isLoading: isAllDepartmentsLoading } = useDepartments();

  // Determine which departments to use and loading state
  const departmentsToUse = shouldLoadAllDepartments ? allDepartments : complexDepartments;
  const isDepartmentsLoading = shouldLoadAllDepartments ? isAllDepartmentsLoading : isComplexDepartmentsLoading;

  // Debug logging for departments
  console.log('🏥 Department Loading Results:', {
    shouldLoadAllDepartments,
    shouldLoadComplexDepartments,
    allDepartmentsCount: allDepartments.length,
    complexDepartmentsCount: complexDepartments.length,
    departmentsToUseCount: departmentsToUse.length,
    isDepartmentsLoading
  });
  
  // Transform to expected format and merge with availableDepartments for compatibility
  const allAvailableDepartments = [
    ...availableDepartments,
    ...departmentsToUse.map(dept => ({
      id: dept._id,
      name: dept.name,
      description: dept.description
    }))
  ].filter((dept, index, arr) => 
    arr.findIndex(d => d.id === dept.id) === index
  ); // Remove duplicates

  // Apply data inheritance from parent (complex or organization) if available
  const getInheritedValue = (field: keyof ClinicOverviewDto, currentValue?: any) => {
    if (!useInheritance || !parentData || currentValue) return currentValue;
    return parentData[field];
  };

  const form = useForm<ClinicOverviewFormData>({
    resolver: zodResolver(clinicOverviewSchema),
    defaultValues: {
      name: initialData.name || '',
      headDoctorName: initialData.headDoctorName || '',
      specialization: initialData.specialization || '',
      licenseNumber: initialData.licenseNumber || '',
      pin: initialData.pin || '',
      logoUrl: initialData.logoUrl || parentData?.logoUrl || '',
      website: initialData.website || parentData?.website || '',
      // Apply inheritance for business profile fields
      yearEstablished: initialData.yearEstablished || parentData?.yearEstablished,
      mission: initialData.mission || parentData?.mission || '',
      vision: initialData.vision || parentData?.vision || '',
      overview: initialData.overview || parentData?.overview || '',
      goals: initialData.goals || parentData?.goals || '',
      ceoName: initialData.ceoName || parentData?.ceoName || '',
      complexDepartmentId: initialData.complexDepartmentId || undefined,
      // Contact information default values
      address: (initialData as any).address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        googleLocation: ''
      },
      email: (initialData as any).email || '',
      phoneNumbers: (initialData as any).phoneNumbers || [{ number: '', type: 'primary' as const, label: '' }],
      emergencyContact: (initialData as any).emergencyContact || {
        name: '',
        phone: '',
        email: '',
        relationship: ''
      },
      socialMediaLinks: (initialData as any).socialMediaLinks || {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        whatsapp: '',
        youtube: '',
        website: ''
      }
    },
    mode: 'onChange' // Enable real-time validation
  });

  // Phone numbers field array
  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: 'phoneNumbers'
  });

  // Trigger validation when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name) {
        form.trigger(name);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Real-time validation for clinic name uniqueness
  const currentName = form.watch('name') || '';
  const isEditingExistingName = Boolean(
    initialData?.name && 
    initialData.name.trim().length > 0 && 
    currentName.trim().toLowerCase() === initialData.name.trim().toLowerCase()
  );
  
  const clinicNameValidation = useUniqueValidation(
    currentName,
    'clinicName',
    800, // 800ms debounce delay
    { 
      complexId: parentData?.id || parentData?._id,
      organizationId: parentData?.organizationId 
    },
    isEditingExistingName // Skip validation if editing existing clinic name
  );

  // Real-time validation for medical license uniqueness
  const currentLicense = form.watch('licenseNumber') || '';
  const isEditingExistingLicense = Boolean(
    initialData?.licenseNumber && 
    initialData.licenseNumber.trim().length > 0 && 
    currentLicense.trim().toLowerCase() === initialData.licenseNumber.trim().toLowerCase()
  );
  
  const licenseValidation = useUniqueValidation(
    currentLicense,
    'medicalLicense',
    800, // 800ms debounce delay
    {},
    isEditingExistingLicense || currentLicense.trim().length === 0 // Skip validation if editing existing license or empty
  );

  const handleInheritanceToggle = () => {
    const newUseInheritance = !useInheritance;
    setUseInheritance(newUseInheritance);
    
    if (newUseInheritance && parentData) {
      // Apply inheritance by updating form values
      const currentValues = form.getValues();
      form.reset({
        ...currentValues,
        logoUrl: currentValues.logoUrl || parentData.logoUrl || '',
        yearEstablished: currentValues.yearEstablished || parentData.yearEstablished,
        mission: currentValues.mission || parentData.mission || '',
        vision: currentValues.vision || parentData.vision || '',
        overview: currentValues.overview || parentData.overview || '',
        goals: currentValues.goals || parentData.goals || '',
        ceoName: currentValues.ceoName || parentData.ceoName || ''
      });
      toast.success(`Inherited data from ${parentData.type || 'parent'}`);
    }
  };

  const onSubmit = async (data: ClinicOverviewFormData) => {
    try {
      // Validate department selection for complex/company plans when complexId is provided
      if ((planType === 'complex' || planType === 'company') && complexId && !data.complexDepartmentId) {
        form.setError('complexDepartmentId', {
          type: 'manual',
          message: 'Department selection is required for complex/company plans'
        });
        toast.error('Please select a department for this clinic');
        return;
      }

      // Services will be handled in the ClinicServicesCapacityForm step

      // Debug: Log department selection
      console.log('🔍 Frontend complexDepartmentId processing:', {
        formValue: data.complexDepartmentId,
        type: typeof data.complexDepartmentId,
        length: data.complexDepartmentId?.length,
        complexId: complexId,
        parentData: parentData?.id || parentData?._id
      });

      // Transform form data to ClinicOverviewDto
      const clinicData: ClinicOverviewDto = {
        name: data.name,
        headDoctorName: data.headDoctorName || undefined,
        specialization: data.specialization || undefined,
        licenseNumber: data.licenseNumber || undefined,
        pin: data.pin || undefined,
        logoUrl: data.logoUrl || parentData?.logoUrl || undefined,
        website: data.website || undefined,
        // Flattened business profile fields
        yearEstablished: data.yearEstablished,
        mission: data.mission || undefined,
        vision: data.vision || undefined,
        overview: data.overview || undefined,
        goals: data.goals || undefined,
        ceoName: data.ceoName || undefined,
        complexDepartmentId: data.complexDepartmentId && data.complexDepartmentId.trim() !== '' ? data.complexDepartmentId : undefined
      };

      console.log('✅ Frontend final complexDepartmentId:', clinicData.complexDepartmentId);

      // Save to backend
      const response = await saveClinicOverview(clinicData);
      
      if (response.success) {
        toast.success('Clinic overview saved successfully!');
        onNext(clinicData);
      } else {
        throw new Error(response.message || 'Failed to save clinic overview');
      }
    } catch (error: any) {
      console.error('Error saving clinic overview:', error);
      
      if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: 'manual',
            message: err.message
          });
        });
      } else {
        toast.error('Failed to save clinic overview', {
          description: error.message || 'An unexpected error occurred'
        });
      }
    }
  };

  const { colors } = useClivinaTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="p-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors font-lato"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Previous Step
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Clinic Information
          </h1>
          <p className="text-muted-foreground font-lato">
            Set up your clinic with medical information and services
          </p>
          
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
            
            {/* Logo and Clinic Name Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-primary font-lato">
                  Logo<span className="text-red-500 ml-1">*</span>
                </label>
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          className="border-2 border-dashed border-border-light bg-surface-tertiary rounded-lg p-8 text-center cursor-pointer hover:bg-surface-hover transition-colors"
                          onClick={() => {/* Handle file upload if needed */}}
                        >
                          {field.value ? (
                            <div className="flex flex-col items-center">
                              <img src={field.value} alt="Logo" className="w-12 h-12 object-contain mb-2 rounded" />
                              <p className="text-sm text-primary-500">
                                Logo uploaded successfully
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto mb-2 text-text-secondary" />
                              <p className="text-sm mb-1 text-primary-500">
                                Click or Drag file to this area to upload
                              </p>
                              <p className="text-xs text-text-secondary">
                                SVG, PNG, JPG or GIF, Maximum file size 2MB.
                              </p>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-6">
                {/* Clinic Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-primary font-lato">
                    Clinic Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                              <StethoscopeIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                            </div>
                            <Input
                              {...field}
                              placeholder="Enter clinic name"
                              className={`h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground ${getValidationStatusClass(clinicNameValidation)}`}
                              style={{
                                boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                borderRadius: '8px'
                              }}
                              disabled={isLoading || clinicNameValidation.isChecking}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <ValidationMessage validation={clinicNameValidation} />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Head Doctor Name Field */}
                <FormFieldWithIcon
                  control={form.control}
                  name="headDoctorName"
                  label="Head Doctor Name"
                  placeholder="Dr. John Smith"
                  icon={User}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Year of Establishment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-primary font-lato">
                  Year Established
                </label>
                <FormField
                  control={form.control}
                  name="yearEstablished"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                            <Calendar className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                          </div>
                          <Input
                            type="number"
                            value={field.value || ''}
                            name={field.name}
                            onBlur={field.onBlur}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? parseInt(value) : undefined);
                            }}
                            placeholder="Enter Year"
                            className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                            style={{
                              boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

                  {/* Department Selection - Show for clinic plan always, and for complex/company plans when loading or when complexId exists */}
                  {(planType === 'clinic' || (planType === 'complex' || planType === 'company') && (effectiveComplexId || isDepartmentsLoading || allAvailableDepartments.length > 0)) && (
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="complexDepartmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-primary font-lato">
                              {planType === 'clinic' ? 'Department (Optional)' : 
                               (complexId ? 'Complex Department *' : 'Complex Department (Optional)')}
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                // Handle "none" and empty string by converting to undefined
                                field.onChange(value === '' || value === 'none' ? undefined : value);
                              }} 
                              value={field.value || 'none'} 
                              disabled={isLoading || isDepartmentsLoading}
                            >
                              <SelectTrigger className="h-[48px] text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm">
                                <SelectValue placeholder={
                                  isDepartmentsLoading 
                                    ? "Loading departments..." 
                                    : planType === 'clinic'
                                    ? "Select a department (optional)"
                                    : complexId
                                    ? "Select a department (required for complex/company plans)"
                                    : "Select a department"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {(planType === 'clinic' || !effectiveComplexId) && <SelectItem value="none">No department</SelectItem>}
                                {allAvailableDepartments.length === 0 && !isDepartmentsLoading && (planType === 'complex' || planType === 'company') && effectiveComplexId && (
                                  <SelectItem value="none" disabled>No departments assigned to this complex</SelectItem>
                                )}
                                {allAvailableDepartments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    <div className="flex flex-col">
                                      <span className="font-lato">{dept.name}</span>
                                      {dept.description && (
                                        <span className="text-xs text-muted-foreground truncate font-lato">
                                          {dept.description}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="text-xs text-muted-foreground font-lato">
                              {planType === 'clinic' 
                                ? 'Optionally link this clinic to a department for organization purposes.'
                                : complexId 
                                ? 'Link this clinic to a complex department for proper organization. This is required for complex/company plans.'
                                : 'Link this clinic to a complex department if applicable'
                              }
                            </div>
                            {useInheritance && parentData?.complexDepartmentId && (
                              <div className="text-xs text-primary font-lato">
                                Inherited from {parentData.type || 'parent'}: Department selected
                              </div>
                            )}
                            <FormMessage />
                            {(planType === 'complex' || planType === 'company') && effectiveComplexId && !field.value && (
                              <div className="text-xs text-destructive font-lato">
                                Department selection is required for complex/company plans
                                {allAvailableDepartments.length === 0 && !isDepartmentsLoading && (
                                  <span className="block mt-1">
                                    ⚠️ No departments found for this complex. Please ensure departments were selected during complex creation.
                                  </span>
                                )}
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  )}



            {/* Business Profile Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsBusinessProfileExpanded(!isBusinessProfileExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Business Profile
                  </h3>
                  {isBusinessProfileExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isBusinessProfileExpanded && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                      {/* Mission Field */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="mission"
                        label="Mission"
                        placeholder="Enter Mission"
                        icon={Target}
                        disabled={isLoading}
                        multiline={true}
                      />

                      {/* Vision Field */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="vision"
                        label="Vision"
                        placeholder="Enter Vision"
                        icon={Eye}
                        disabled={isLoading}
                        multiline={true}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                      {/* Clinic Overview */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="overview"
                        label="Clinic Overview"
                        placeholder="Describe your clinic's services..."
                        icon={FileText}
                        disabled={isLoading}
                        multiline={true}
                      />

                      {/* Clinic Goals */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="goals"
                        label="Clinic Goals"
                        placeholder="What are your clinic's goals?"
                        icon={Target}
                        disabled={isLoading}
                        multiline={true}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* CEO Name Field */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="ceoName"
                        label="CEO/Director Name"
                        placeholder="Enter CEO/Director Name"
                        icon={User}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Address Information Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Address Information
                  </h3>
                  {isAddressExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isAddressExpanded && (
                  <>
                    {/* Street Address */}
                    <FormFieldWithIcon
                      control={form.control}
                      name="address.street"
                      label="Street Address"
                      placeholder="123 Medical Center Street"
                      icon={MapPinIcon}
                      disabled={isLoading}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* City */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="address.city"
                        label="City"
                        placeholder="Riyadh"
                        icon={Building}
                        disabled={isLoading}
                      />

                      {/* State/Province */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="address.state"
                        label="State/Province"
                        placeholder="Riyadh Province"
                        icon={Building}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Postal Code */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="address.postalCode"
                        label="Postal Code"
                        placeholder="12345"
                        icon={Hash}
                        disabled={isLoading}
                      />

                      {/* Country */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="address.country"
                        label="Country"
                        placeholder="Saudi Arabia"
                        icon={GlobeIcon}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Google Location */}
                    <FormFieldWithIcon
                      control={form.control}
                      name="address.googleLocation"
                      label="Google Maps Location"
                      placeholder="https://maps.google.com/... or coordinates"
                      icon={GlobeIcon}
                      disabled={isLoading}
                    />
                  </>
                )}
              </div>
            </Card>

            {/* Contact Information Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsContactExpanded(!isContactExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Contact Information
                  </h3>
                  {isContactExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isContactExpanded && (
                  <>
                    {/* Email */}
                    <FormFieldWithIcon
                      control={form.control}
                      name="email"
                      label="Email Address"
                      placeholder="clinic@example.com"
                      icon={MailIcon}
                      disabled={isLoading}
                    />

                    {/* Phone Numbers */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-bold text-primary font-lato">Phone Numbers</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendPhone({ number: '', type: 'secondary', label: '' })}
                          disabled={isLoading}
                          className="font-lato"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Phone
                        </Button>
                      </div>

                      {phoneFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-border rounded-lg bg-muted/20">
                          {/* Phone Number */}
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.number`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-foreground font-lato">Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="+966 11 123 4567"
                                    className="h-[40px] border-border bg-background text-foreground font-lato"
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Phone Type */}
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-foreground font-lato">Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                  <SelectTrigger className="h-[40px] border-border bg-background text-foreground font-lato">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="primary">Primary</SelectItem>
                                    <SelectItem value="secondary">Secondary</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                    <SelectItem value="fax">Fax</SelectItem>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Label */}
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-foreground font-lato">Label</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Main office"
                                    className="h-[40px] border-border bg-background text-foreground font-lato"
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Remove Button */}
                          <div className="flex items-end">
                            {phoneFields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePhone(index)}
                                disabled={isLoading}
                                className="h-[40px] w-full font-lato"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Emergency Contact Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsEmergencyExpanded(!isEmergencyExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Emergency Contact
                  </h3>
                  {isEmergencyExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isEmergencyExpanded && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Emergency Contact Name */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="emergencyContact.name"
                        label="Contact Name"
                        placeholder="Dr. John Smith"
                        icon={User}
                        disabled={isLoading}
                      />

                      {/* Relationship */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="emergencyContact.relationship"
                        label="Relationship"
                        placeholder="Head Doctor, Manager, etc."
                        icon={User}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Emergency Contact Phone */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="emergencyContact.phone"
                        label="Phone Number"
                        placeholder="+966 50 123 4567"
                        icon={PhoneIcon}
                        disabled={isLoading}
                      />

                      {/* Emergency Contact Email */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="emergencyContact.email"
                        label="Email Address"
                        placeholder="emergency@clinic.com"
                        icon={MailIcon}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Social Media Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsSocialMediaExpanded(!isSocialMediaExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Social Media & Web Presence
                  </h3>
                  {isSocialMediaExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isSocialMediaExpanded && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Website */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="socialMediaLinks.website"
                        label="Website"
                        placeholder="https://www.yourclinic.com"
                        icon={GlobeIcon}
                        disabled={isLoading}
                      />

                      {/* Facebook */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="socialMediaLinks.facebook"
                        label="Facebook"
                        placeholder="https://facebook.com/yourclinic"
                        icon={GlobeIcon}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Instagram */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="socialMediaLinks.instagram"
                        label="Instagram"
                        placeholder="https://instagram.com/yourclinic"
                        icon={GlobeIcon}
                        disabled={isLoading}
                      />

                      {/* LinkedIn */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="socialMediaLinks.linkedin"
                        label="LinkedIn"
                        placeholder="https://linkedin.com/company/yourclinic"
                        icon={GlobeIcon}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* WhatsApp */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="socialMediaLinks.whatsapp"
                        label="WhatsApp"
                        placeholder="https://wa.me/966501234567"
                        icon={PhoneIcon}
                        disabled={isLoading}
                      />

                      {/* YouTube */}
                      <FormFieldWithIcon
                        control={form.control}
                        name="socialMediaLinks.youtube"
                        label="YouTube"
                        placeholder="https://youtube.com/c/yourclinic"
                        icon={GlobeIcon}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading}
                className="w-full sm:w-auto h-[48px] px-8 font-lato text-primary border-border hover:bg-muted"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                  type="submit"
                  disabled={
                    isLoading || 
                    clinicNameValidation.isChecking || 
                    licenseValidation.isChecking ||
                    !form.formState.isDirty || 
                    Object.keys(form.formState.errors).length > 0 ||
                    (currentLicense.trim().length > 0 && licenseValidation.hasChecked && !licenseValidation.isAvailable)
                  }
                  className="w-full sm:w-auto h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-lato disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
};