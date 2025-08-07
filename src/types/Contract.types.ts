// src/types/Contract.types.ts

export interface Contract {
  id: string;
  contractNumber: string;
  contractName: string;
  customerName: string;
  primeContractor: string;
  isPrime: boolean;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  totalValue: number;
  fundedValue: number;
  standardFullTimeHours: number;
  description?: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateContractDto {
  contractNumber: string;
  contractName: string;
  customerName: string;
  primeContractor: string;
  isPrime: boolean;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  totalValue: number;
  fundedValue: number;
  standardFullTimeHours: number;
  description?: string;
}

export interface UpdateFundingDto {
  modificationNumber: string;
  fundedAmount: number;
  justification?: string;
}

export enum ContractType {
  FixedPrice = 'FixedPrice',
  TimeAndMaterials = 'TimeAndMaterials',
  CostPlus = 'CostPlus',
  LaborHourOnly = 'LaborHourOnly'
}

export enum ContractStatus {
  Draft = 'Draft',
  Active = 'Active',
  Closed = 'Closed'
}

export enum FundingWarningLevel {
  None = 'None',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

// Helper function to calculate funding warning level
export function calculateFundingWarning(contract: Contract): FundingWarningLevel {
  const percentFunded = contract.totalValue > 0 
    ? (contract.fundedValue / contract.totalValue) * 100 
    : 0;
  
  const daysRemaining = Math.floor(
    (new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Critical: Less than 20% funded or less than 30 days remaining
  if (percentFunded < 20 || daysRemaining < 30) {
    return FundingWarningLevel.Critical;
  }
  // High: Less than 40% funded or less than 60 days remaining
  if (percentFunded < 40 || daysRemaining < 60) {
    return FundingWarningLevel.High;
  }
  // Medium: Less than 60% funded or less than 90 days remaining
  if (percentFunded < 60 || daysRemaining < 90) {
    return FundingWarningLevel.Medium;
  }
  // Low: Less than 80% funded
  if (percentFunded < 80) {
    return FundingWarningLevel.Low;
  }
  
  return FundingWarningLevel.None;
}

// Helper function to format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper function to format date
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}