// src/types/ContractResource.types.ts

export interface AssignResourceDto {
  resourceId: string;
  allocationPercentage: number;
  annualHours: number;
  startDate: string;
  endDate?: string;
  contractBillRateOverride?: number;
}

export interface UpdateResourceAssignmentDto {
  allocationPercentage?: number;
  annualHours?: number;
  endDate?: string;
  contractBillRateOverride?: number;
}

export interface ContractResource {
  id: string;
  contractId: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  lcatTitle?: string;
  allocationPercentage: number;
  annualHours: number;
  startDate: string;
  endDate?: string;
  contractBillRateOverride?: number;
  isActive: boolean;
  // Calculated fields
  payRate: number;
  burdenedCost: number;
  billRate: number;
  monthlyBurn: number;
  annualBurn: number;
  margin: number;
  isUnderwater: boolean;
}

export interface ResourceAvailability {
  resourceId: string;
  resourceName: string;
  currentAllocation: number;
  availableAllocation: number;
  isFullyAllocated: boolean;
  isOnBench: boolean;
  currentContracts: ContractAllocation[];
}

export interface ContractAllocation {
  contractId: string;
  contractNumber: string;
  customerName: string;
  allocationPercentage: number;
  startDate: string;
  endDate?: string;
}

export interface ContractBurnRate {
  contractId: string;
  contractNumber: string;
  totalValue: number;
  fundedValue: number;
  actualBurnedAmount?: number;
  estimatedMonthlyBurn: number;
  actualMonthlyBurn: number;
  estimatedAnnualBurn: number;
  actualAnnualBurn: number;
  monthsUntilDepletion?: number;
  projectedDepletionDate?: string;
  fundingWarningLevel: string;
  fundingPercentageUsed: number;
  assignedResourceCount: number;
  assignedResources: ContractResource[];
}

// Helper functions
export const formatAllocation = (percentage: number): string => {
  return `${percentage}%`;
};

export const getAllocationColor = (percentage: number): string => {
  if (percentage === 0) return '#6B7280'; // Gray - On bench
  if (percentage < 50) return '#10B981'; // Green - Available
  if (percentage < 80) return '#F59E0B'; // Yellow - Partially allocated
  if (percentage < 100) return '#3B82F6'; // Blue - Nearly full
  return '#EF4444'; // Red - Fully allocated
};

export const getMarginColor = (margin: number): string => {
  if (margin < 0) return '#EF4444'; // Red - Underwater
  if (margin < 10) return '#F59E0B'; // Yellow - Low margin
  if (margin < 20) return '#3B82F6'; // Blue - Acceptable
  return '#10B981'; // Green - Good margin
};

export const calculateRemainingHours = (annualHours: number, allocationPercentage: number): number => {
  return Math.round((annualHours * allocationPercentage) / 100);
};