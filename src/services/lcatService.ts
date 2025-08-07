import api from './api';
import { LCAT, CreateLCAT, BatchUpdateRates } from '../types/LCAT.types';

export const lcatService = {
  getAll: async (): Promise<LCAT[]> => {
    try {
      // Using the correct path from Swagger
      const response = await api.get('/api/LCAT');
      return response.data;
    } catch (error) {
      console.error('Error fetching LCATs:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<LCAT> => {
    try {
      const response = await api.get(`/api/LCAT/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching LCAT ${id}:`, error);
      throw error;
    }
  },

  create: async (data: CreateLCAT): Promise<LCAT> => {
    try {
      const response = await api.post('/api/LCAT', data);
      return response.data;
    } catch (error) {
      console.error('Error creating LCAT:', error);
      throw error;
    }
  },

  batchUpdateRates: async (data: BatchUpdateRates): Promise<void> => {
    try {
      await api.post('/api/LCAT/batch-update-rates', data);
    } catch (error) {
      console.error('Error batch updating rates:', error);
      throw error;
    }
  }
};