'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { Search, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Department {
  _id?: string;
  name: string;
  description?: string;
}

interface DepartmentSearchInputProps {
  selectedDepartments: Department[];
  availableDepartments: Department[];
  onDepartmentsChange: (departments: Department[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
}

export const DepartmentSearchInput: React.FC<DepartmentSearchInputProps> = ({
  selectedDepartments = [],
  availableDepartments = [],
  onDepartmentsChange,
  disabled = false,
  placeholder = "Search or add departments...",
  maxSelections,
  className
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter departments based on search input
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredDepartments([]);
      return;
    }

    const searchLower = searchInput.toLowerCase().trim();
    const filtered = availableDepartments.filter(dept => {
      const isAlreadySelected = selectedDepartments.some(selected => 
        selected._id ? selected._id === dept._id : selected.name.toLowerCase() === dept.name.toLowerCase()
      );
      return !isAlreadySelected && dept.name.toLowerCase().includes(searchLower);
    });

    setFilteredDepartments(filtered);
  }, [searchInput, availableDepartments, selectedDepartments]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setIsDropdownOpen(true);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = searchInput.trim();
      
      if (trimmedInput) {
        // Check if it's an exact match with existing departments
        const exactMatch = availableDepartments.find(dept => 
          dept.name.toLowerCase() === trimmedInput.toLowerCase()
        );

        if (exactMatch) {
          addDepartment(exactMatch);
        } else {
          // Create new department
          const newDepartment: Department = {
            name: trimmedInput,
            description: `New department: ${trimmedInput}`
          };
          addDepartment(newDepartment);
        }
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const addDepartment = (department: Department) => {
    if (maxSelections && selectedDepartments.length >= maxSelections) {
      return;
    }

    // Check if already selected
    const isAlreadySelected = selectedDepartments.some(selected => 
      selected._id && department._id 
        ? selected._id === department._id 
        : selected.name.toLowerCase() === department.name.toLowerCase()
    );

    if (!isAlreadySelected) {
      onDepartmentsChange([...selectedDepartments, department]);
      setSearchInput('');
      setIsDropdownOpen(false);
    }
  };

  const removeDepartment = (indexToRemove: number) => {
    const updatedDepartments = selectedDepartments.filter((_, index) => index !== indexToRemove);
    onDepartmentsChange(updatedDepartments);
  };

  const handleCreateNew = () => {
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      const newDepartment: Department = {
        name: trimmedInput,
        description: `New department: ${trimmedInput}`
      };
      addDepartment(newDepartment);
    }
  };

  // Check if the search input matches an existing department exactly
  const hasExactMatch = availableDepartments.some(dept => 
    dept.name.toLowerCase() === searchInput.toLowerCase().trim()
  );

  const canCreateNew = searchInput.trim() && !hasExactMatch;
  const isMaxReached = Boolean(maxSelections && selectedDepartments.length >= maxSelections);

  return (
    <div className={cn('relative w-full', className)} ref={dropdownRef}>
      
      {/* Selected Departments */}
      {selectedDepartments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedDepartments.map((dept, index) => (
            <Badge
              key={dept._id || `${dept.name}-${index}`}
              variant="secondary"
              className="px-2 py-1 flex items-center gap-1"
            >
              <span className="text-sm">{dept.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeDepartment(index)}
                  className="h-4 w-4 rounded-full hover:bg-gray-300 flex items-center justify-center ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={isMaxReached ? `Maximum ${maxSelections} departments reached` : placeholder}
            disabled={disabled || isMaxReached}
            className="pl-10 pr-10 h-12"
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            {isDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && !disabled && !isMaxReached && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto border shadow-lg">
            <CardContent className="p-0">
              
              {/* Filtered Departments */}
              {filteredDepartments.length > 0 && (
                <div className="border-b">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                    Existing Departments
                  </div>
                  {filteredDepartments.map((dept) => (
                    <button
                      key={dept._id || dept.name}
                      type="button"
                      onClick={() => addDepartment(dept)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-medium text-sm">{dept.name}</div>
                        {dept.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {dept.description}
                          </div>
                        )}
                      </div>
                      <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              )}

              {/* Create New Option */}
              {canCreateNew && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                    Create New
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-sm text-green-700">
                        Create "{searchInput.trim()}"
                      </div>
                      <div className="text-xs text-gray-500">
                        Add as new department
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                  </button>
                </div>
              )}

              {/* No Results */}
              {!canCreateNew && filteredDepartments.length === 0 && searchInput.trim() && (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  {hasExactMatch ? 'Department already selected' : 'No departments found'}
                </div>
              )}

              {/* Initial State */}
              {!searchInput.trim() && (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  Type to search departments or create new ones
                </div>
              )}

            </CardContent>
          </Card>
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500">
        {maxSelections && (
          <span>
            {selectedDepartments.length}/{maxSelections} departments selected
          </span>
        )}
        {!maxSelections && selectedDepartments.length > 0 && (
          <span>{selectedDepartments.length} departments selected</span>
        )}
        {selectedDepartments.length === 0 && (
          <span>Press Enter to add departments, or select from dropdown</span>
        )}
      </div>
    </div>
  );
};