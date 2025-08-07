export interface LCAT {
  id: string;
  name: string;
  description: string;
  currentPublishedRate: number | null;
  currentDefaultBillRate: number | null;
  positionTitles: string[];
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateLCAT {
  name: string;
  description: string;
  publishedRate: number;
  defaultBillRate: number;
  positionTitles: string[];
}

export interface BatchUpdateRates {
  effectiveDate: string;
  notes: string;
  rateUpdates: LCATRateUpdate[];
}

export interface LCATRateUpdate {
  lcatId: string;
  publishedRate?: number;
  defaultBillRate?: number;
}