'use client';

import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, BuildingIcon, StethoscopeIcon } from "lucide-react";
import { toast } from 'sonner';
import { ClinicOverviewDto } from '@/types/onboarding';
import { saveClinicOverview } from '@/api/onboardingApiClient';
import { LogoUpload } from '@/components/ui/logo-upload';
import { useUniqueValidation, getValidationStatusClass, getValidationMessage } from '@/hooks/useUniqueValidation';
import { useDepartmentsByComplex, useDepartments } from '@/hooks/api/useDepartments';
import { DepartmentSearchInput, Department } from '@/components/ui/department-search-input';

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
    
  complexDepartmentId: z.string().optional()
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
      complexDepartmentId: initialData.complexDepartmentId || undefined
    },
    mode: 'onChange' // Enable real-time validation
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Clinic Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Overview</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Clinic Information
        </h1>
        <p className="text-gray-600">
          Set up your clinic with medical information and services
        </p>
        
        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mb-4">
            <strong>Debug:</strong> Plan: {planType}, ComplexId: {complexId || 'none'}, 
            EffectiveComplexId: {effectiveComplexId || 'none'}, 
            Departments: {allAvailableDepartments.length}, 
            Loading: {isDepartmentsLoading ? 'yes' : 'no'}
          </div>
        )}
      </div>

      {/* Data Inheritance Option */}
      {parentData && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Inherit from {parentData.type === 'complex' ? 'Complex' : 'Organization'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Copy business information from "{parentData.name}"
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={useInheritance ? "default" : "outline"}
                size="sm"
                onClick={handleInheritanceToggle}
              >
                {useInheritance ? 'Using Inherited Data' : `Use ${parentData.type === 'complex' ? 'Complex' : 'Organization'} Data`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information Section */}
          <Card>
            <Collapsible open={isBasicInfoExpanded} onOpenChange={setIsBasicInfoExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <StethoscopeIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                      <p className="text-sm text-gray-600">Essential clinic details</p>
                    </div>
                  </div>
                  {isBasicInfoExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  
                  {/* Clinic Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Clinic Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter clinic name"
                            className="h-12"
                            disabled={isLoading || clinicNameValidation.isChecking}
                          />
                        </FormControl>
                        <FormMessage />
                        {clinicNameValidation.isChecking && (
                          <p className="text-sm text-blue-600">Checking availability...</p>
                        )}
                        {clinicNameValidation.hasChecked && !clinicNameValidation.isAvailable && (
                          <p className="text-sm text-red-600">{clinicNameValidation.message}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Head Doctor Name */}
                    <FormField
                      control={form.control}
                      name="headDoctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Head Doctor Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Dr. John Smith"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Specialization */}
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Specialization</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Cardiology, Pediatrics"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* License Number */}
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical License Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="ML123456"
                              className="h-12"
                              disabled={isLoading || licenseValidation.isChecking}
                            />
                          </FormControl>
                          <FormMessage />
                          {licenseValidation.isChecking && currentLicense.trim().length > 0 && (
                            <p className="text-sm text-blue-600">Checking license availability...</p>
                          )}
                          {licenseValidation.hasChecked && !licenseValidation.isAvailable && currentLicense.trim().length > 0 && (
                            <p className="text-sm text-red-600">{licenseValidation.message}</p>
                          )}
                          {licenseValidation.hasChecked && licenseValidation.isAvailable && currentLicense.trim().length > 0 && (
                            <p className="text-sm text-green-600">Medical license is available</p>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* PIN */}
                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional PIN</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="PIN12345"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Year Established */}
                    <FormField
                      control={form.control}
                      name="yearEstablished"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Established</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 2020"
                              className="h-12"
                              disabled={isLoading}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : undefined);
                              }}
                            />
                          </FormControl>
                          {parentData?.yearEstablished && !field.value && (
                            <div className="text-xs text-blue-600">
                              Default from {parentData.type || 'parent'}: {parentData.yearEstablished}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Logo URL */}
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Logo</FormLabel>
                          <FormControl>
                            <LogoUpload
                              value={field.value || ''}
                              onChange={field.onChange}
                              disabled={isLoading}
                              placeholder="Upload your clinic logo"
                            />
                          </FormControl>
                          {parentData?.logoUrl && !field.value && (
                            <div className="text-xs text-blue-600">
                              Default from {parentData.type || 'parent'}: Logo available
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Website */}
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://yourclinic.com"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Department Selection - Show for clinic plan always, and for complex/company plans when loading or when complexId exists */}
                  {(planType === 'clinic' || (planType === 'complex' || planType === 'company') && (effectiveComplexId || isDepartmentsLoading || allAvailableDepartments.length > 0)) && (
                    <FormField
                      control={form.control}
                      name="complexDepartmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
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
                            <SelectTrigger className="h-12">
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
                                    <span>{dept.name}</span>
                                    {dept.description && (
                                      <span className="text-xs text-gray-500 truncate">
                                        {dept.description}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-500">
                            {planType === 'clinic' 
                              ? 'Optionally link this clinic to a department for organization purposes.'
                              : complexId 
                              ? 'Link this clinic to a complex department for proper organization. This is required for complex/company plans.'
                              : 'Link this clinic to a complex department if applicable'
                            }
                          </div>
                          {useInheritance && parentData?.complexDepartmentId && (
                            <div className="text-xs text-blue-600">
                              Inherited from {parentData.type || 'parent'}: Department selected
                            </div>
                          )}
                          <FormMessage />
                          {(planType === 'complex' || planType === 'company') && effectiveComplexId && !field.value && (
                            <div className="text-xs text-red-600">
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
                  )}

                  {/* CEO/Director Name */}
                  <FormField
                    control={form.control}
                    name="ceoName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEO/Director Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Name of CEO or Director"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        {parentData?.ceoName && !field.value && (
                          <div className="text-xs text-blue-600">
                            Default from {parentData.type || 'parent'}: {parentData.ceoName}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Business Profile Section */}
          <Card>
            <Collapsible open={isBusinessProfileExpanded} onOpenChange={setIsBusinessProfileExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
                    <p className="text-sm text-gray-600">Mission, vision, and clinic description</p>
                  </div>
                  {isBusinessProfileExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  {/* Clinic Overview */}
                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Overview</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your clinic's services, specialties, and approach to patient care..."
                            className="min-h-[120px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/1000 characters
                        </div>
                        {parentData?.overview && !field.value && (
                          <div className="text-xs text-blue-600">
                            Default from {parentData.type || 'parent'}: {parentData.overview}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Clinic Goals */}
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Goals</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What are your clinic's main goals and objectives?"
                            className="min-h-[120px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/1000 characters
                        </div>
                        {parentData?.goals && !field.value && (
                          <div className="text-xs text-blue-600">
                            Default from {parentData.type || 'parent'}: {parentData.goals}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mission Statement */}
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What is your clinic's mission?"
                            className="min-h-[100px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/500 characters
                        </div>
                        {parentData?.mission && !field.value && (
                          <div className="text-xs text-blue-600">
                            Default from {parentData.type || 'parent'}: {parentData.mission}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vision Statement */}
                  <FormField
                    control={form.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vision Statement</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What is your clinic's vision for the future?"
                            className="min-h-[100px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/500 characters
                        </div>
                        {parentData?.vision && !field.value && (
                          <div className="text-xs text-blue-600">
                            Default from {parentData.type || 'parent'}: {parentData.vision}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Information Card - Services will be handled in the next step */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <StethoscopeIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Next Step: Services & Capacity</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>Services:</strong> Define medical services your clinic provides in the next step.</p>
                    <p>• <strong>Capacity:</strong> Set operational limits to ensure smooth clinic management.</p>
                    <p>• <strong>Flexibility:</strong> All settings can be modified later through the clinic management dashboard.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {/* Debug info for button state */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mr-2">
                  Dirty: {form.formState.isDirty ? '✅' : '❌'} | 
                  Name: {clinicNameValidation.isChecking ? '⏳' : '✅'} |
                  License: {licenseValidation.isChecking ? '⏳' : '✅'} |
                  Errors: {Object.keys(form.formState.errors).length}
                  {Object.keys(form.formState.errors).length > 0 && (
                    <div className="text-red-500 text-xs">
                      {JSON.stringify(form.formState.errors, null, 2)}
                    </div>
                  )}
                </div>
              )}
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
                className="flex items-center gap-2 min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

        </form>
      </Form>
    </div>
  );
};