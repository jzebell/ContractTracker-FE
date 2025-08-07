// Resource type definitions matching the backend DTOs and domain model

export enum ResourceType {
  W2Internal = 'W2Internal',
  Subcontractor = 'Subcontractor',
  Contractor1099 = 'Contractor1099',
  FixedPrice = 'FixedPrice'
}

export interface Resource {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  resourceType: string;
  lcatId: string;
  lcatName?: string;
  contractId?: string;
  contractName?: string;
  hourlyRate: number;
  annualSalary?: number;
  burdenedCost: number;
  billRate?: number;
  margin?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdDate?: string;
  createdBy?: string;
  fixedPriceAmount?: number;
  fixedPriceHours?: number;
}

export interface CreateResource {
  firstName: string;
  lastName: string;
  email: string;
  resourceType: ResourceType;
  lcatId: string;
  contractId?: string;
  hourlyRate: number;
  annualSalary?: number;
  startDate: string;
  fixedPriceAmount?: number;
  fixedPriceHours?: number;
}

export interface UpdateResource {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  lcatId?: string;
  contractId?: string;
  hourlyRate?: number;
  annualSalary?: number;
  endDate?: string;
  isActive?: boolean;
}

export interface BatchUpdateResources {
  effectiveDate: string;
  notes?: string;
  resourceUpdates: UpdateResource[];
}

export interface ResourceFilters {
  searchTerm?: string;
  resourceType?: ResourceType;
  lcatId?: string;
  contractId?: string;
  isActive?: boolean;
}

// Wrap rate configuration by resource type
export const WRAP_RATES: Record<ResourceType, number> = {
  [ResourceType.W2Internal]: 2.28,
  [ResourceType.Subcontractor]: 1.15,
  [ResourceType.Contractor1099]: 1.15,
  [ResourceType.FixedPrice]: 1.0
};

// Helper function to calculate burdened cost
export const calculateBurdenedCost = (hourlyRate: number, resourceType: ResourceType): number => {
  return hourlyRate * WRAP_RATES[resourceType];
};

// Helper function to calculate margin
export const calculateMargin = (billRate: number | undefined, burdenedCost: number): number | undefined => {
  if (!billRate) return undefined;
  return billRate - burdenedCost;
};

// Helper function to determine if resource is "underwater" (negative margin)
export const isUnderwater = (margin: number | undefined): boolean => {
  return margin !== undefined && margin < 0;
};