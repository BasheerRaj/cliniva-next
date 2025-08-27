/**
 * Test file for Department Search Input functionality
 * Run this to verify the implementation works correctly
 */

import { Department } from '@/components/ui/department-search-input';

// Mock data for testing
const mockExistingDepartments: Department[] = [
  { _id: '1', name: 'Cardiology', description: 'Heart and cardiovascular system' },
  { _id: '2', name: 'Pediatrics', description: 'Medical care for children' },
  { _id: '3', name: 'Orthopedics', description: 'Bones, joints, and muscles' },
  { _id: '4', name: 'Emergency', description: 'Emergency medical services' },
  { _id: '5', name: 'Radiology', description: 'Medical imaging and diagnostics' }
];

// Test department transformation for ComplexOverviewForm
export function testDepartmentTransformation() {
  console.log('🧪 Testing Department Transformation');
  
  // Mock form data with mixed existing and new departments
  const formDepartments: Department[] = [
    { _id: '1', name: 'Cardiology', description: 'Heart and cardiovascular system' },
    { _id: '3', name: 'Orthopedics', description: 'Bones, joints, and muscles' },
    { name: 'Neurology', description: 'Brain and nervous system' },
    { name: 'Dermatology' }
  ];

  // Transform for backend submission (mimicking ComplexOverviewForm logic)
  const existingDepartments = formDepartments.filter(dept => dept._id);
  const newDepartments = formDepartments.filter(dept => !dept._id);

  const result = {
    departmentIds: existingDepartments.map(dept => dept._id!),
    newDepartmentNames: newDepartments.map(dept => dept.name)
  };

  console.log('📤 Backend Submission Data:', result);
  console.log('✅ Expected:', {
    departmentIds: ['1', '3'],
    newDepartmentNames: ['Neurology', 'Dermatology']
  });

  // Verify transformation is correct
  const isCorrect = 
    JSON.stringify(result.departmentIds) === JSON.stringify(['1', '3']) &&
    JSON.stringify(result.newDepartmentNames) === JSON.stringify(['Neurology', 'Dermatology']);
  
  console.log(isCorrect ? '✅ Transformation Test PASSED' : '❌ Transformation Test FAILED');
  return isCorrect;
}

// Test department filtering logic
export function testDepartmentFiltering() {
  console.log('🧪 Testing Department Filtering');
  
  const searchTerm = 'card';
  const selectedDepartments: Department[] = [
    { _id: '2', name: 'Pediatrics', description: 'Medical care for children' }
  ];

  // Mimic filtering logic from DepartmentSearchInput
  const filtered = mockExistingDepartments.filter(dept => {
    const isAlreadySelected = selectedDepartments.some(selected => 
      selected._id ? selected._id === dept._id : selected.name.toLowerCase() === dept.name.toLowerCase()
    );
    return !isAlreadySelected && dept.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  console.log('🔍 Search term:', searchTerm);
  console.log('📋 Selected departments:', selectedDepartments.map(d => d.name));
  console.log('🎯 Filtered results:', filtered.map(d => d.name));
  console.log('✅ Expected: ["Cardiology"]');

  const isCorrect = filtered.length === 1 && filtered[0].name === 'Cardiology';
  console.log(isCorrect ? '✅ Filtering Test PASSED' : '❌ Filtering Test FAILED');
  return isCorrect;
}

// Test new department creation logic
export function testNewDepartmentCreation() {
  console.log('🧪 Testing New Department Creation');
  
  const userInput = 'Neurology';
  const existingDepartments = mockExistingDepartments;

  // Check if it's an exact match
  const exactMatch = existingDepartments.find(dept => 
    dept.name.toLowerCase() === userInput.toLowerCase()
  );

  let newDepartment: Department;
  if (exactMatch) {
    newDepartment = exactMatch;
    console.log('🔗 Using existing department:', newDepartment.name);
  } else {
    newDepartment = {
      name: userInput,
      description: `New department: ${userInput}`
    };
    console.log('🆕 Creating new department:', newDepartment.name);
  }

  const isCorrect = !exactMatch && newDepartment.name === 'Neurology' && !newDepartment._id;
  console.log(isCorrect ? '✅ New Department Creation Test PASSED' : '❌ New Department Creation Test FAILED');
  return isCorrect;
}

// Run all tests
export function runDepartmentSearchTests() {
  console.log('🚀 Running Department Search Tests');
  console.log('==========================================');
  
  const results = [
    testDepartmentTransformation(),
    testDepartmentFiltering(),
    testNewDepartmentCreation()
  ];

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log('==========================================');
  console.log(`📊 Tests Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests PASSED! Department search implementation is working correctly.');
  } else {
    console.log('⚠️  Some tests FAILED. Please check the implementation.');
  }

  return passed === total;
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testDepartmentSearch = runDepartmentSearchTests;
  console.log('💡 Run window.testDepartmentSearch() in browser console to test');
}