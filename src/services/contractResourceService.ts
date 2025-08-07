// src/services/contractResourceService.ts

import axios from 'axios';
import {
  ContractResource,
  AssignResourceDto,
  UpdateResourceAssignmentDto,
  ResourceAvailability,
  ContractBurnRate
} from '../types/ContractResource.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5154';

export const contractResourceService = {
  // Get all resources assigned to a contract
  async getContractResources(contractId: string): Promise<ContractResource[]> {
    const response = await axios.get(`${API_URL}/api/Contract/${contractId}/resources`);
    return response.data;
  },

  // Assign a resource to a contract
  async assignResource(contractId: string, assignment: AssignResourceDto): Promise<ContractResource> {
    const response = await axios.post(
      `${API_URL}/api/Contract/${contractId}/resources`,
      assignment
    );
    return response.data;
  },

  // Update a resource assignment
  async updateAssignment(
    contractId: string,
    resourceId: string,
    update: UpdateResourceAssignmentDto
  ): Promise<ContractResource> {
    const response = await axios.put(
      `${API_URL}/api/Contract/${contractId}/resources/${resourceId}`,
      update
    );
    return response.data;
  },

  // Remove a resource from a contract
  async removeResource(
    contractId: string,
    resourceId: string,
    endDate?: string
  ): Promise<void> {
    const params = endDate ? { endDate } : {};
    await axios.delete(
      `${API_URL}/api/Contract/${contractId}/resources/${resourceId}`,
      { params }
    );
  },

  // Get available resources for assignment
  async getAvailableResources(
    contractId: string,
    minAvailablePercentage?: number
  ): Promise<ResourceAvailability[]> {
    const params = minAvailablePercentage ? { minAvailablePercentage } : {};
    const response = await axios.get(
      `${API_URL}/api/Contract/${contractId}/available-resources`,
      { params }
    );
    return response.data;
  },

  // Get contract burn rate analysis
  async getContractBurnRate(contractId: string): Promise<ContractBurnRate> {
    const response = await axios.get(`${API_URL}/api/Contract/${contractId}/burn-rate`);
    return response.data;
  }
};