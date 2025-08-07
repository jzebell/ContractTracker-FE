import api from './api';
import { 
  Resource, 
  CreateResource, 
  UpdateResource, 
  BatchUpdateResources,
  ResourceFilters 
} from '../types/Resource.types';

class ResourceService {
  private baseUrl = '/api/Resource';  // Changed to match Swagger

  /**
   * Get all resources with optional filtering
   */
  async getAll(filters?: ResourceFilters): Promise<Resource[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.searchTerm) params.append('search', filters.searchTerm);
        if (filters.resourceType) params.append('type', filters.resourceType);
        if (filters.lcatId) params.append('lcatId', filters.lcatId);
        if (filters.contractId) params.append('contractId', filters.contractId);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      
      const response = await api.get<Resource[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  /**
   * Get a single resource by ID
   */
  async getById(id: string): Promise<Resource> {
    const response = await api.get<Resource>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new resource
   */
  async create(resource: CreateResource): Promise<Resource> {
    const response = await api.post<Resource>(this.baseUrl, resource);
    return response.data;
  }

  /**
   * Update an existing resource
   */
  async update(id: string, resource: UpdateResource): Promise<Resource> {
    const response = await api.put<Resource>(`${this.baseUrl}/${id}`, resource);
    return response.data;
  }

  /**
   * Batch update multiple resources
   * Used for inline editing with save-all functionality
   */
  async batchUpdate(updates: BatchUpdateResources): Promise<Resource[]> {
    const response = await api.put<Resource[]>(`${this.baseUrl}/batch`, updates);
    return response.data;
  }

  /**
   * Terminate a resource (soft delete)
   */
  async terminate(id: string, endDate: string): Promise<void> {
    await api.post(`${this.baseUrl}/${id}/terminate`, { endDate });
  }

  /**
   * Assign resource to a contract
   */
  async assignToContract(resourceId: string, contractId: string): Promise<Resource> {
    const response = await api.post<Resource>(
      `${this.baseUrl}/${resourceId}/assign-contract`,
      { contractId }
    );
    return response.data;
  }

  /**
   * Get resource cost analysis
   * Returns detailed cost breakdown including wrap rates and margins
   */
  async getCostAnalysis(id: string): Promise<any> {
    const response = await api.get(`${this.baseUrl}/${id}/cost-analysis`);
    return response.data;
  }

  /**
   * Check for resources with negative margin ("underwater")
   */
  async getUnderwaterResources(contractId?: string): Promise<Resource[]> {
    const url = contractId 
      ? `${this.baseUrl}/underwater?contractId=${contractId}`
      : `${this.baseUrl}/underwater`;
    
    const response = await api.get<Resource[]>(url);
    return response.data;
  }

  /**
   * Export resources to Excel
   */
  async exportToExcel(filters?: ResourceFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.resourceType) params.append('type', filters.resourceType);
      if (filters.lcatId) params.append('lcatId', filters.lcatId);
      if (filters.contractId) params.append('contractId', filters.contractId);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/export?${queryString}` : `${this.baseUrl}/export`;
    
    const response = await api.get(url, {
      responseType: 'blob'
    });
    
    return response.data;
  }
}

export const resourceService = new ResourceService();