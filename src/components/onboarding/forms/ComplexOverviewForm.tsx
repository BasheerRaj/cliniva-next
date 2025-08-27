'use client';

import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, BuildingIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from 'sonner';
import { fetchDepartments } from '@/api/onboardingApiClient';
import { ComplexOverviewDto } from '@/types/onboarding';
import { saveComplexOverview, validateComplexName } from '@/api/onboardingApiClient';
import { LogoUpload } from '@/components/ui/logo-upload';
import { DepartmentSearchInput, Department } from '@/components/ui/department-search-input';
import { useUniqueValidation, getValidationStatusClass, getValidationMessage } from '@/hooks/useUniqueValidation';

// Form validation schema matching new flattened ComplexOverviewDto
const complexOverviewSchema = z.object({
  // Required fields
  name: z.string()
    .min(2, 'Complex name must be at least 2 characters')
    .max(100, 'Complex name must be less than 100 characters')
    .trim(),
  
  // Optional basic info
  managerName: z.string()
    .max(50, 'Manager name must be less than 50 characters')
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
    
  // Flattened business profile fields (no nested businessProfile object)
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
    
  // Department management - simplified to single array
  departments: z.array(z.object({
    _id: z.string().optional(),
    name: z.string().min(1, 'Department name is required'),
    description: z.string().optional()
  }))
});

type ComplexOverviewFormData = z.infer<typeof complexOverviewSchema>;

interface ComplexOverviewFormProps {
  onNext: (data: ComplexOverviewDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ComplexOverviewDto>;
  organizationData?: any; // For inheritance
  isLoading?: boolean;
}

export const ComplexOverviewForm: React.FC<ComplexOverviewFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  organizationData,
  isLoading = false
}) => {
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [isDepartmentsExpanded, setIsDepartmentsExpanded] = useState(false);
  const [useInheritance, setUseInheritance] = useState(false);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);

  // Load departments on component mount
  React.useEffect(() => {
    fetchDepartments()
      .then((data: any[]) => {
        const formattedDepartments: Department[] = data.map(dept => ({
          _id: dept._id || dept.id,
          name: dept.name,
          description: dept.description
        }));
        setAllDepartments(formattedDepartments);
      })
      .catch(() => toast.error('Failed to load departments'));
  }, []);

  // Apply data inheritance from organization if available and requested
  const getInheritedValue = (field: keyof ComplexOverviewDto, currentValue?: any) => {
    if (!useInheritance || !organizationData || currentValue) return currentValue;
    return organizationData[field];
  };

  const form = useForm<ComplexOverviewFormData>({
    resolver: zodResolver(complexOverviewSchema),
    defaultValues: {
      name: initialData.name || '',
      managerName: initialData.managerName || '',
      logoUrl: initialData.logoUrl || getInheritedValue('logoUrl') || '',
      website: initialData.website || '',
      // Apply inheritance for business profile fields
      yearEstablished: getInheritedValue('yearEstablished', initialData.yearEstablished),
      mission: getInheritedValue('mission', initialData.mission) || '',
      vision: getInheritedValue('vision', initialData.vision) || '',
      overview: initialData.overview || '',
      goals: initialData.goals || '',
      ceoName: getInheritedValue('ceoName', initialData.ceoName) || '',
      departments: initialData.departments || (
        // Convert legacy departmentIds/newDepartmentNames to departments format
        [
          ...(initialData.departmentIds || []).map(id => ({ _id: id, name: 'Loading...' })),
          ...(initialData.newDepartmentNames || []).map(name => ({ name }))
        ]
      )
    }
  });

  // Real-time validation for complex name uniqueness
  const currentName = form.watch('name') || '';
  const isEditingExistingName = Boolean(
    initialData?.name && 
    initialData.name.trim().length > 0 && 
    currentName.trim().toLowerCase() === initialData.name.trim().toLowerCase()
  );
  
  const complexNameValidation = useUniqueValidation(
    currentName,
    'complexName',
    800, // 800ms debounce delay
    { organizationId: organizationData?.overview?.id || organizationData?.overview?._id },
    isEditingExistingName // Skip validation if editing existing complex name
  );

  const handleInheritanceToggle = () => {
    const newUseInheritance = !useInheritance;
    setUseInheritance(newUseInheritance);
    
    if (newUseInheritance && organizationData) {
      // Apply inheritance by updating form values
      const currentValues = form.getValues();
      form.reset({
        ...currentValues,
        logoUrl: currentValues.logoUrl || organizationData.logoUrl || '',
        yearEstablished: currentValues.yearEstablished || organizationData.yearEstablished,
        mission: currentValues.mission || organizationData.mission || '',
        vision: currentValues.vision || organizationData.vision || '',
        ceoName: currentValues.ceoName || organizationData.ceoName || ''
      });
      toast.success('Inherited data from organization');
    }
  };

  // Handle department changes
  const handleDepartmentChange = (departments: Department[]) => {
    form.setValue('departments', departments, { shouldValidate: true });
  };

  const onSubmit = async (data: ComplexOverviewFormData) => {
    try {
      // Separate existing departments from new ones
      const existingDepartments = data.departments.filter(dept => dept._id);
      const newDepartments = data.departments.filter(dept => !dept._id);

      // Transform form data to ComplexOverviewDto
      const complexData: ComplexOverviewDto = {
        name: data.name,
        managerName: data.managerName || undefined,
        logoUrl: data.logoUrl || undefined,
        website: data.website || undefined,
        // Flattened business profile fields
        yearEstablished: data.yearEstablished,
        mission: data.mission || undefined,
        vision: data.vision || undefined,
        overview: data.overview || undefined,
        goals: data.goals || undefined,
        ceoName: data.ceoName || undefined,
        // Department management - backend expects these fields
        departmentIds: existingDepartments.map(dept => dept._id!),
        newDepartmentNames: newDepartments.map(dept => dept.name)
      };

      console.log('📤 Submitting complex overview:', complexData);

      // Save to backend
      const response = await saveComplexOverview(complexData);
      
      if (response.success) {
        console.log('✅ Complex overview saved successfully:', response);
        toast.success('Complex overview saved successfully!');
        
        // Pass the response data including entityId to the parent
        onNext({
          ...complexData,
          entityId: response.entityId,
          complexId: response.entityId
        } as any);
      } else {
        throw new Error(response.message || 'Failed to save complex overview');
      }
    } catch (error: any) {
      console.error('❌ Error saving complex overview:', error);
      
      if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: 'manual',
            message: err.message
          });
        });
        toast.error('Please check the form for errors');
      } else {
        toast.error(error.message || 'Failed to save complex overview');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Complex Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Overview</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complex Information
        </h1>
        <p className="text-gray-600">
          Set up your medical complex with departments and management details
        </p>
      </div>

      {/* Data Inheritance Option */}
      {organizationData && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Inherit from Organization</h3>
                  <p className="text-sm text-blue-700">
                    Copy business information from "{organizationData.name}"
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={useInheritance ? "default" : "outline"}
                size="sm"
                onClick={handleInheritanceToggle}
              >
                {useInheritance ? 'Using Inherited Data' : 'Use Organization Data'}
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
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                    <p className="text-sm text-gray-600">Essential complex details</p>
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
                  
                  {/* Complex Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Complex Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter complex name"
                            className="h-12"
                            disabled={isLoading || complexNameValidation.isChecking}
                          />
                        </FormControl>
                        <FormMessage />
                        {complexNameValidation.isChecking && (
                          <p className="text-sm text-blue-600">Checking availability...</p>
                        )}
                        {complexNameValidation.hasChecked && !complexNameValidation.isAvailable && (
                          <p className="text-sm text-red-600">{complexNameValidation.message}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Manager Name */}
                    <FormField
                      control={form.control}
                      name="managerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complex Manager</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Manager's full name"
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
                          {useInheritance && organizationData?.yearEstablished && (
                            <div className="text-xs text-blue-600">
                              Inherited: {organizationData.yearEstablished}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Logo Upload */}
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complex Logo</FormLabel>
                          <FormControl>
                            <LogoUpload
                              value={field.value || ''}
                              onChange={field.onChange}
                              disabled={isLoading}
                              placeholder="Upload your complex logo"
                            />
                          </FormControl>
                          {useInheritance && organizationData?.logoUrl && !field.value && (
                            <div className="text-xs text-blue-600">
                              Inherited logo from organization
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
                              placeholder="https://yourcomplex.com"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CEO Name */}
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
                        {useInheritance && organizationData?.ceoName && (
                          <div className="text-xs text-blue-600">
                            Inherited: {organizationData.ceoName}
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
                    <p className="text-sm text-gray-600">Mission, vision, and complex description</p>
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

                  {/* Complex Overview */}
                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complex Overview</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your complex's services and specialties..."
                            className="min-h-[120px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/1000 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Complex Goals */}
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complex Goals</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What are your complex's main goals and objectives?"
                            className="min-h-[120px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/1000 characters
                        </div>
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
                            placeholder="What is your complex's mission?"
                            className="min-h-[100px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/500 characters
                        </div>
                        {useInheritance && organizationData?.mission && (
                          <div className="text-xs text-blue-600">
                            Inherited: {organizationData.mission}
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
                            placeholder="What is your complex's vision for the future?"
                            className="min-h-[100px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/500 characters
                        </div>
                        {useInheritance && organizationData?.vision && (
                          <div className="text-xs text-blue-600">
                            Inherited: {organizationData.vision}
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

          {/* Departments Section */}
          <Card>
            <Collapsible open={isDepartmentsExpanded} onOpenChange={setIsDepartmentsExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
                    <p className="text-sm text-gray-600">Medical departments and specialties</p>
                  </div>
                  {isDepartmentsExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  {/* Searchable Department Selection */}
                  <FormField
                    control={form.control}
                    name="departments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Medical Departments
                        </FormLabel>
                        <FormControl>
                          <DepartmentSearchInput
                            selectedDepartments={field.value || []}
                            availableDepartments={allDepartments}
                            onDepartmentsChange={handleDepartmentChange}
                            disabled={isLoading}
                            placeholder="Search departments or create new ones..."
                            maxSelections={20}
                            className="w-full"
                          />
                        </FormControl>
                        <div className="text-sm text-gray-600">
                          Search existing departments or type new names to create them.
                          Selected departments will be linked to your complex.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
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
              <Button
                type="submit"
                disabled={isLoading || complexNameValidation.isChecking || !form.formState.isValid}
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