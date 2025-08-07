// src/services/contractService.ts

import axios from 'axios';
import { Contract, CreateContractDto, UpdateFundingDto } from '../types/Contract.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5154';

export const contractService = {
  // Get all contracts
  async getContracts(): Promise<Contract[]> {
    const response = await axios.get(`${API_URL}/api/Contract`);
    return response.data;
  },

  // Get single contract
  async getContract(id: string): Promise<Contract> {
    const response = await axios.get(`${API_URL}/api/Contract/${id}`);
    return response.data;
  },

  // Create contract
  async createContract(contract: CreateContractDto): Promise<Contract> {
    const response = await axios.post(`${API_URL}/api/Contract`, contract);
    return response.data;
  },

  // Activate contract
  async activateContract(id: string): Promise<void> {
    await axios.post(`${API_URL}/api/Contract/${id}/activate`);
  },

  // Close contract
  async closeContract(id: string): Promise<void> {
    await axios.post(`${API_URL}/api/Contract/${id}/close`);
  },

  // Update funding
  async updateFunding(id: string, funding: UpdateFundingDto): Promise<void> {
    await axios.post(`${API_URL}/api/Contract/${id}/update-funding`, funding);
  },

  // Delete contract
  async deleteContract(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/Contract/${id}`);
  }
};