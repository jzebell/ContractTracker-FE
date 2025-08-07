import axios from 'axios';
import {
  DashboardMetrics,
  ContractHealthCard,
  ResourceUtilizationMetrics,
  FinancialProjections,
  AlertNotification
} from '../types/Dashboard.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5154';

class DashboardService {
  private baseUrl = `${API_URL}/api/Dashboard`;

  async getMetrics(): Promise<DashboardMetrics> {
    const response = await axios.get<DashboardMetrics>(`${this.baseUrl}/metrics`);
    return response.data;
  }

  async getContractHealth(): Promise<ContractHealthCard[]> {
    const response = await axios.get<ContractHealthCard[]>(`${this.baseUrl}/contracts/health`);
    return response.data;
  }

  async getResourceUtilization(): Promise<ResourceUtilizationMetrics> {
    const response = await axios.get<ResourceUtilizationMetrics>(`${this.baseUrl}/resources/utilization`);
    return response.data;
  }

  async getProjections(months: number = 12): Promise<FinancialProjections> {
    const response = await axios.get<FinancialProjections>(`${this.baseUrl}/projections`, {
      params: { months }
    });
    return response.data;
  }

  async getAlerts(): Promise<AlertNotification[]> {
    const response = await axios.get<AlertNotification[]>(`${this.baseUrl}/alerts`);
    return response.data;
  }

  async getCompleteDashboard(): Promise<{
    metrics: DashboardMetrics;
    contracts: ContractHealthCard[];
    resources: ResourceUtilizationMetrics;
    alerts: AlertNotification[];
    timestamp: string;
  }> {
    const response = await axios.get(`${this.baseUrl}/complete`);
    return response.data;
  }
}

export default new DashboardService();