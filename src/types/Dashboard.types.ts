// Dashboard type definitions

export interface DashboardMetrics {
  totalContractValue: number;
  totalFundedValue: number;
  totalBurnedAmount: number;
  monthlyBurnRate: number;
  quarterlyBurnRate: number;
  activeContracts: number;
  draftContracts: number;
  closedContracts: number;
  criticalContracts: number;
  warningContracts: number;
  overallHealth: PortfolioHealth;
  projectedMonthlyRevenue: number;
  projectedMonthlyProfit: number;
  calculatedAt: string;
}

export interface ContractHealthCard {
  contractId: string;
  contractNumber: string;
  customerName: string;
  primeContractorName: string;
  isPrime: boolean;
  status: ContractStatus;
  totalValue: number;
  fundedValue: number;
  burnedAmount: number;
  monthlyBurnRate: number;
  monthsUntilDepletion: number;
  projectedDepletionDate?: string;
  warningLevel: FundingWarningLevel;
  resourceCount: number;
  resourceUtilization: number;
  profitMargin: number;
  alerts: string[];
  trend: ContractTrend;
}

export interface ResourceUtilizationMetrics {
  totalResources: number;
  activeResources: number;
  benchResources: number;
  underwaterResources: number;
  averageUtilization: number;
  totalMonthlyCost: number;
  totalMonthlyRevenue: number;
  metricsByType: Record<string, ResourceTypeMetrics>;
  topUtilizedResources: ResourceAllocation[];
  underutilizedResources: ResourceAllocation[];
}

export interface ResourceTypeMetrics {
  resourceType: string;
  count: number;
  averageCost: number;
  averageRevenue: number;
  averageMargin: number;
  utilizationPercentage: number;
}

export interface ResourceAllocation {
  resourceId: string;
  resourceName: string;
  lcatTitle: string;
  totalAllocation: number;
  contractCount: number;
  monthlyCost: number;
  monthlyRevenue: number;
  isUnderwater: boolean;
}

export interface FinancialProjections {
  projections: MonthlyProjection[];
  totalProjectedRevenue: number;
  totalProjectedCost: number;
  totalProjectedProfit: number;
  depletionSchedule: ContractDepletion[];
  projectionDate: string;
  monthsProjected: number;
}

export interface MonthlyProjection {
  month: string;
  projectedRevenue: number;
  projectedCost: number;
  projectedProfit: number;
  cumulativeRevenue: number;
  cumulativeCost: number;
  activeContractCount: number;
  expiringContracts: string[];
  depletingContracts: string[];
}

export interface ContractDepletion {
  contractId: string;
  contractNumber: string;
  estimatedDepletionDate: string;
  remainingFunds: number;
  daysUntilDepletion: number;
  impactSeverity: string;
}

export interface AlertNotification {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export enum PortfolioHealth {
  Excellent = 'Excellent',
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
  Critical = 'Critical'
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

export enum ContractTrend {
  Improving = 'Improving',
  Stable = 'Stable',
  Declining = 'Declining'
}

export enum AlertType {
  FundingCritical = 'FundingCritical',
  FundingWarning = 'FundingWarning',
  ResourceUnderwater = 'ResourceUnderwater',
  ContractExpiring = 'ContractExpiring',
  OverAllocation = 'OverAllocation',
  UnderUtilization = 'UnderUtilization',
  AnomalyDetected = 'AnomalyDetected'
}

export enum AlertSeverity {
  Info = 'Info',
  Warning = 'Warning',
  High = 'High',
  Critical = 'Critical'
}

// Helper functions for formatting and display
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getHealthColor = (health: PortfolioHealth): string => {
  switch (health) {
    case PortfolioHealth.Excellent: return 'text-green-600 bg-green-100';
    case PortfolioHealth.Good: return 'text-blue-600 bg-blue-100';
    case PortfolioHealth.Fair: return 'text-yellow-600 bg-yellow-100';
    case PortfolioHealth.Poor: return 'text-orange-600 bg-orange-100';
    case PortfolioHealth.Critical: return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getWarningIcon = (level: FundingWarningLevel): string => {
  switch (level) {
    case FundingWarningLevel.Critical: return '🔴';
    case FundingWarningLevel.High: return '🟠';
    case FundingWarningLevel.Medium: return '🟡';
    case FundingWarningLevel.Low: return '🔵';
    default: return '🟢';
  }
};

export const getTrendIcon = (trend: ContractTrend): string => {
  switch (trend) {
    case ContractTrend.Improving: return '📈';
    case ContractTrend.Declining: return '📉';
    default: return '➡️';
  }
};

export const getSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case AlertSeverity.Critical: return 'border-red-500 bg-red-50';
    case AlertSeverity.High: return 'border-orange-500 bg-orange-50';
    case AlertSeverity.Warning: return 'border-yellow-500 bg-yellow-50';
    default: return 'border-blue-500 bg-blue-50';
  }
};